"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw, Share2, Smartphone, X } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const INSTALL_DISMISSED_KEY = "agrienv-install-dismissed-until";
const DISMISS_FOR_DAYS = 7;

function installationWasDismissed() {
  try {
    return Number(localStorage.getItem(INSTALL_DISMISSED_KEY) || 0) > Date.now();
  } catch {
    return false;
  }
}

function isRunningStandalone() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function PWAProvider() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallCard, setShowInstallCard] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      if (!installationWasDismissed() && !isRunningStandalone()) {
        setShowInstallCard(true);
      }
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setShowInstallCard(false);
      toast.success("AgriEnv installed", {
        description: "You can now open it from your home screen or applications menu.",
      });
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIosDevice() && !isRunningStandalone() && !installationWasDismissed()) {
      iosTimer = setTimeout(() => setShowInstallCard(true), 2800);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    let reloading = false;
    let updateTimer: ReturnType<typeof setInterval> | undefined;

    const activateUpdate = (worker: ServiceWorker) => {
      worker.postMessage({ type: "SKIP_WAITING" });
    };

    const announceUpdate = (worker: ServiceWorker) => {
      toast.info("AgriEnv update ready", {
        id: "agrienv-update",
        description: "Refresh to use the latest version of the platform.",
        duration: Infinity,
        action: {
          label: "Update",
          onClick: () => activateUpdate(worker),
        },
        icon: <RefreshCw className="h-[18px] w-[18px] text-[#2d8a50]" />,
      });
    };

    const handleControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        if (registration.waiting) announceUpdate(registration.waiting);

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              announceUpdate(worker);
            }
          });
        });

        updateTimer = setInterval(() => void registration.update(), 60 * 60 * 1000);
      })
      .catch(() => {
        // The website remains fully usable if service-worker registration is unavailable.
      });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      if (updateTimer) clearInterval(updateTimer);
    };
  }, []);

  const dismissInstallCard = () => {
    setShowInstallCard(false);
    setShowIosInstructions(false);
    try {
      localStorage.setItem(
        INSTALL_DISMISSED_KEY,
        String(Date.now() + DISMISS_FOR_DAYS * 24 * 60 * 60 * 1000)
      );
    } catch {
      // Private browsing can restrict local storage; dismissal still works for this session.
    }
  };

  const installApp = async () => {
    if (!installPrompt) {
      setShowIosInstructions(true);
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);

    if (choice.outcome === "accepted") {
      setShowInstallCard(false);
    } else {
      dismissInstallCard();
    }
  };

  if (!showInstallCard) return null;

  const ios = isIosDevice();

  return (
    <section
      role="dialog"
      aria-label="Install AgriEnv"
      aria-live="polite"
      className="animate-fade-up fixed left-3 right-3 z-[70] mx-auto max-w-md overflow-hidden rounded-[1.25rem] border border-[#cadbcf] bg-white shadow-[0_24px_70px_rgba(18,56,32,0.22)] sm:left-auto sm:right-5"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="h-1 bg-gradient-to-r from-[#155c35] via-[#2e8a50] to-[#b8d767]" />
      <div className="p-4 sm:p-5">
        <button
          type="button"
          onClick={dismissInstallCard}
          className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-lg text-[#748078] transition-colors hover:bg-[#eef3ed] hover:text-[#284532]"
          aria-label="Dismiss installation prompt"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e7f3e9] text-[#17643a]">
            {showIosInstructions ? <Share2 className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
          </span>
          <div>
            <p className="text-sm font-bold text-[#193624]">
              {showIosInstructions ? "Add AgriEnv to your iPhone" : "Install AgriEnv"}
            </p>
            <p className="mt-1 text-xs leading-5 text-[#68766d]">
              {showIosInstructions
                ? "Tap the Share button in Safari, then choose “Add to Home Screen”."
                : "Open your study workspace faster from your home screen—even when the connection is unreliable."}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={dismissInstallCard} className="btn-secondary min-h-10 flex-1 px-3 py-2 text-xs">
            {showIosInstructions ? "Got it" : "Not now"}
          </button>
          {!showIosInstructions && (
            <button type="button" onClick={installApp} className="btn-primary min-h-10 flex-1 px-3 py-2 text-xs">
              {ios ? <Share2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
              {ios ? "Show me how" : "Install app"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
