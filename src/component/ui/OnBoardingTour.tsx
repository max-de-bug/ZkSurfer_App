"use client"

import "shepherd.js/dist/css/shepherd.css"
import Shepherd, { type Tour } from "shepherd.js"
import { useEffect, useRef, useState } from "react"
import type { StaticImageData } from "next/image"

interface OnboardingTourProps {
  isOpen: boolean
  onClose: () => void
}

// Helper function to extract URL from StaticImageData or string
const getImageUrl = (imageData: string | StaticImageData): string => {
  if (typeof imageData === 'string') {
    return imageData
  }
  return imageData.src
}

export function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
  const tourRef = useRef<Tour | null>(null)
  const [mediaUrls, setMediaUrls] = useState<{
    connectWalletGif: string | null
    predictionGif: string | null
    imageGif: string | null
    apiGif: string | null
  }>({ connectWalletGif: null, predictionGif: null, imageGif: null, apiGif: null })

  const cleanupTour = () => {
    if (tourRef.current) {
      tourRef.current.off("cancel")
      tourRef.current.off("complete")

      try {
        if (tourRef.current.isActive()) {
          tourRef.current.hide()
          tourRef.current.cancel()
        }
      } catch (error) {
        console.warn("Error cleaning up tour:", error)
      }

      setTimeout(() => {
        const overlays = document.querySelectorAll(".shepherd-modal-overlay-container")
        overlays.forEach((overlay) => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay)
          }
        })

        const shepherdElements = document.querySelectorAll(".shepherd-element")
        shepherdElements.forEach((element) => {
          if (element.parentNode) {
            element.parentNode.removeChild(element)
          }
        })
      }, 100)
    }
    onClose()
  }

  // Load media files and create blob URLs
  useEffect(() => {
    const loadMediaFiles = async () => {
      try {
        // Dynamic import all GIF files from tmp folder
        const connectWalletModule = await import("../../../tmp/connect-wallet.gif")
        const predictionModule = await import("../../../tmp/prediction.gif")
        const imageModule = await import("../../../tmp/image.gif")
        const apiModule = await import("../../../tmp/api.gif")
        
        // Extract the src property using helper function
        const connectWalletUrl = getImageUrl(connectWalletModule.default)
        const predictionUrl = getImageUrl(predictionModule.default)
        const imageUrl = getImageUrl(imageModule.default)
        const apiUrl = getImageUrl(apiModule.default)
        
        console.log("Loaded media files:", { 
          connectWallet: connectWalletUrl,
          prediction: predictionUrl,
          image: imageUrl,
          api: apiUrl
        })
        
        setMediaUrls({
          connectWalletGif: connectWalletUrl,
          predictionGif: predictionUrl,
          imageGif: imageUrl,
          apiGif: apiUrl
        })
      } catch (error) {
        console.error("Failed to load media files:", error)
        // Set fallback values
        setMediaUrls({ 
          connectWalletGif: null, 
          predictionGif: null, 
          imageGif: null, 
          apiGif: null 
        })
      }
    }

    loadMediaFiles()
  }, [])

  const createTourSteps = () => {
    if (!tourRef.current) return

    // Step 1: Connect Wallet
    tourRef.current.addStep({
      id: "connect-wallet",
      title: "Connect Your Wallet",
      text: `
        <div style="text-align: center; color: #e5e7eb; padding: 20px;">
          <div class="tour-media-container" id="connect-wallet-media">
            ${mediaUrls.connectWalletGif ? 
              `<img 
                src="${mediaUrls.connectWalletGif}"
                alt="Connect wallet demonstration"
                style="
                  width: 100%; 
                  height: 100%; 
                  border-radius: 8px;
                  object-fit: cover;
                "
              />` :
              `<div style="
                color: #60a5fa; 
                font-size: 24px; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                gap: 8px;
              ">
                <div style="
                  width: 40px;
                  height: 40px;
                  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 20px;
                ">🔗</div>
                <div style="font-size: 12px; color: #9ca3af;">Connect Wallet</div>
              </div>`
            }
          </div>
          <p style="margin: 8px 0; color: #e5e7eb; line-height: 1.6; font-size: 15px;">
            Click here to connect your Solana wallet or login via your email.
          </p>
        </div>
      `,
      attachTo: { element: ".wallet-button", on: "bottom" },
      buttons: [
        {
          text: "Exit",
          classes: "shepherd-button-secondary",
          action: cleanupTour,
        },
        {
          text: "Next",
          action: () => tourRef.current!.next(),
        },
      ],
    })

    // Step 2: Prediction Report
    tourRef.current.addStep({
      id: "view-prediction",
      title: "Check Your Prediction Report",
      text: `
        <div style="text-align: center; color: #e5e7eb; padding: 20px;">
          <div class="tour-media-container" id="prediction-media">
            ${mediaUrls.predictionGif ? 
              `<img 
                src="${mediaUrls.predictionGif}"
                alt="Prediction report demonstration"
                style="
                  width: 100%; 
                  height: 100%; 
                  border-radius: 8px;
                  object-fit: cover;
                "
              />` :
              `<div style="
                color: #10b981; 
                font-size: 24px; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                gap: 8px;
              ">
                <div style="
                  width: 40px;
                  height: 40px;
                  background: linear-gradient(135deg, #10b981, #047857);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 20px;
                ">📊</div>
                <div style="font-size: 12px; color: #9ca3af;">Prediction Report</div>
              </div>`
            }
          </div>
          <p style="margin: 8px 0; color: #e5e7eb; line-height: 1.6; font-size: 15px;">
            View your latest prediction insights here.
          </p>
        </div>
      `,
      attachTo: { element: ".prediction-card", on: "left" },
      buttons: [
        {
          text: "Exit",
          classes: "shepherd-button-secondary",
          action: cleanupTour,
        },
        {
          text: "Next",
          action: () => tourRef.current!.next(),
        },
      ],
    })

    // Step 3: Command Palette
    tourRef.current.addStep({
      id: "use-command-palette",
      title: "Run Image/Video Commands",
      text: `
        <div style="text-align: center; color: #e5e7eb; padding: 20px;">
          <div class="tour-media-container">
            ${mediaUrls.imageGif ? 
              `<img 
                src="${mediaUrls.imageGif}"
                alt="Command palette demonstration"
                style="
                  width: 100%; 
                  height: 100%; 
                  border-radius: 8px;
                  object-fit: cover;
                "
              />` :
              `<div style="
                color: #f59e0b; 
                font-size: 24px; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                gap: 8px;
              ">
                <div style="
                  width: 40px;
                  height: 40px;
                  background: linear-gradient(135deg, #f59e0b, #d97706);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 20px;
                ">⌨️</div>
                <div style="font-size: 12px; color: #9ca3af;">Command Palette</div>
              </div>`
            }
          </div>
          <p style="margin: 8px 0; color: #e5e7eb; line-height: 1.6; font-size: 15px;">
            Type <code style="
              background-color: #1f2937; 
              color: #fbbf24; 
              padding: 2px 4px; 
              border-radius: 4px; 
              font-size: 14px;
            ">/image-gen</code> or <code style="
              background-color: #1f2937; 
              color: #fbbf24; 
              padding: 2px 4px; 
              border-radius: 4px; 
              font-size: 14px;
            ">/video-gen</code> here to create media.
          </p>
        </div>
      `,
      attachTo: { element: ".command-input", on: "top" },
      buttons: [
        {
          text: "Exit",
          classes: "shepherd-button-secondary",
          action: cleanupTour,
        },
        {
          text: "Next",
          action: () => tourRef.current!.next(),
        },
      ],
    })

    // Step 4: Get API Key
    tourRef.current.addStep({
      id: "get-api-key",
      title: "Generate Your API Key",
      text: `
        <div style="text-align: center; color: #e5e7eb; padding: 20px;">
          <div class="tour-media-container">
            ${mediaUrls.apiGif ? 
              `<img 
                src="${mediaUrls.apiGif}"
                alt="API key demonstration"
                style="
                  width: 100%; 
                  height: 100%; 
                  border-radius: 8px;
                  object-fit: cover;
                "
              />` :
              `<div style="
                color: #8b5cf6; 
                font-size: 24px; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                gap: 8px;
              ">
                <div style="
                  width: 40px;
                  height: 40px;
                  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 20px;
                ">🔑</div>
                <div style="font-size: 12px; color: #9ca3af;">API Key</div>
              </div>`
            }
          </div>
          <p style="margin: 8px 0; color: #e5e7eb; line-height: 1.6; font-size: 15px;">
            Click here to view or create your API key.
          </p>
        </div>
      `,
      attachTo: { element: ".api-key-link", on: "right" },
      buttons: [
        {
          text: "Exit",
          classes: "shepherd-button-secondary",
          action: cleanupTour,
        },
        {
          text: "Done",
          action: cleanupTour,
        },
      ],
    })
  }

  useEffect(() => {
    if (!tourRef.current) {
      const styleId = "shepherd-inline-styles"
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style")
        style.id = styleId
        style.textContent = `
          /* Custom Dark Theme for Shepherd Tour */
          .shepherd-theme-dark.shepherd-element {
            background-color: #08121f !important;
            border: 1px solid #374151 !important;
            border-radius: 16px !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2) !important;
            max-width: 420px !important;
            overflow: hidden !important;
          }
          
          .shepherd-theme-dark .shepherd-header {
            background-color: #08121f !important;
            border-bottom: 1px solid #374151 !important;
            padding: 20px 24px 16px 24px !important;
            border-top-left-radius: 16px !important;
            border-top-right-radius: 16px !important;
          }
          
          .shepherd-theme-dark .shepherd-title {
            background-color: transparent !important;
            color: #ffffff !important;
            font-size: 18px !important;
            font-weight: 600 !important;
            margin: 0 !important;
          }
          
          .shepherd-theme-dark .shepherd-text {
            background-color: transparent !important;
            color: #e5e7eb !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .shepherd-theme-dark .shepherd-content {
            background-color: #08121f !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          
          .shepherd-theme-dark .shepherd-footer {
            background-color: #08121f !important;
            border-top: 1px solid #374151 !important;
            padding: 16px 24px 20px 24px !important;
            text-align: right !important;
            border-bottom-left-radius: 16px !important;
            border-bottom-right-radius: 16px !important;
          }
          
          .shepherd-theme-dark .shepherd-button {
            background-color: #3b82f6 !important;
            color: white !important;
            border: none !important;
            border-radius: 8px !important;
            padding: 8px 16px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            transition: background-color 0.2s ease !important;
          }
          
          .shepherd-theme-dark .shepherd-button:hover {
            background-color: #2563eb !important;
          }
          
          .shepherd-theme-dark .shepherd-button-secondary {
            background-color: #6b7280 !important;
            color: white !important;
          }
          
          .shepherd-theme-dark .shepherd-button-secondary:hover {
            background-color: #4b5563 !important;
          }
          
          .shepherd-theme-dark .shepherd-cancel-icon {
            background-color: transparent !important;
            color: #9ca3af !important;
            border: none !important;
            font-size: 20px !important;
            cursor: pointer !important;
            position: absolute !important;
            top: 12px !important;
            right: 12px !important;
            width: 32px !important;
            height: 32px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 4px !important;
            transition: background-color 0.2s ease !important;
          }
          
          .shepherd-theme-dark .shepherd-cancel-icon:hover {
            background-color: #374151 !important;
            color: #ffffff !important;
          }
          
          /* Arrow styling for dark theme */
          .shepherd-theme-dark .shepherd-arrow {
            border-color: #08121f !important;
          }
          
          .shepherd-theme-dark .shepherd-arrow:before {
            border-color: #374151 !important;
          }
          
          /* Modal overlay */
          .shepherd-modal-overlay-container {
            background-color: rgba(0, 0, 0, 0.75) !important;
            z-index: 9998 !important;
          }
          
          /* Media container styling */
          .tour-media-container {
            margin: 0 auto 16px auto; 
            width: 300px; 
            height: 180px; 
            border-radius: 12px; 
            border: 1px solid #374151;
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
          }
        `
        document.head.appendChild(style)
      }

      tourRef.current = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          scrollTo: { behavior: "smooth", block: "center" },
          cancelIcon: { enabled: true },
          classes: 'shepherd-theme-dark'
        },
      })
    }
  }, [])

  // Create tour steps when media URLs are loaded
  useEffect(() => {
    if (tourRef.current && mediaUrls) {
      // Clear existing steps
      tourRef.current.steps = []
      createTourSteps()
    }
  }, [mediaUrls])

  useEffect(() => {
    if (!tourRef.current) return

    if (isOpen && mediaUrls) {
      tourRef.current.start()
      tourRef.current.on("cancel", cleanupTour)
      tourRef.current.on("complete", cleanupTour)
    } else {
      cleanupTour()
    }

    return () => {
      if (tourRef.current) {
        tourRef.current.off("cancel")
        tourRef.current.off("complete")
      }
    }
  }, [isOpen, mediaUrls])

  useEffect(() => {
    return () => {
      if (tourRef.current) {
        try {
          tourRef.current.off("cancel")
          tourRef.current.off("complete")
          if (tourRef.current.isActive()) {
            tourRef.current.hide()
            tourRef.current.cancel()
          }

          setTimeout(() => {
            const overlays = document.querySelectorAll(".shepherd-modal-overlay-container")
            overlays.forEach((overlay) => {
              if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay)
              }
            })

            const shepherdElements = document.querySelectorAll(".shepherd-element")
            shepherdElements.forEach((element) => {
              if (element.parentNode) {
                element.parentNode.removeChild(element)
              }
            })
          }, 100)
        } catch (error) {
          console.warn("Error during tour cleanup:", error)
        }
      }
    }
  }, [])

  return null
}