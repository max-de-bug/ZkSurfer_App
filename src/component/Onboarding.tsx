"use client";

import React, { useState, useRef, useEffect } from "react";
import Loader from "./Loader";
import ButtonV1 from "./ui/buttonV1";
import { CustomWalletButton } from "./ui/CustomWalletButton";
import { DynamicContextProvider, DynamicWidget } from '@dynamic-labs/sdk-react-core';

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const steps = [
    {
      title: "Automate your web tasks effortlessly",
      description:
        "Discover how ZkSurfer can save you time and enhance your productivity..",
      image: "/images/onboarding/1.png",
    },
    {
      title: "Automate Repetitive Tasks",
      description:
        "ZkSurfer automates tasks like form filling, clicking buttons, and navigating websites, allowing you to focus on more important work.",
      image: "/images/onboarding/2.png",
    },
    {
      title: "Save Time and Energy",
      description:
        "With ZkSurfer handling mundane tasks, you can concentrate on what truly matters, improving efficiency and productivity.",
      image: "/images/onboarding/3.png",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep(steps.length - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 75) {
      handleNext();
    } else if (touchEndX.current - touchStartX.current > 75) {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft" && currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep]);

  function openLink(getStarted: any) {
    throw new Error("Function not implemented.");
  }

  return (
    <div
      className="h-screen flex flex-col bg-[#000A19] text-white justify-center items-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Loader */}
      {currentStep === -1 && <Loader />}

      {/* Onboarding steps */}
      {currentStep >= 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-16 right-28 text-md text-white font-sourceCode"
          >
            Skip
          </button>

          <div className="relative mb-8">
            <img
              src={steps[currentStep].image}
              alt={steps[currentStep].title}
              className="w-full h-full"
            />
            {/* Navigation dots */}
            <div className="absolute flex space-x-2 w-full justify-center items-center">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full  ${
                    index === currentStep ? "bg-white" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4 font-ttfirs">
            {steps[currentStep].title}
          </h2>
          <p className="text-center mb-8 text-[#9475F0] font-sourceCode text-opacity-50">
            {steps[currentStep].description}
          </p>

          {/* Next or Get Started button */}
          {currentStep < steps.length - 1 ? (
            <ButtonV1 onClick={handleNext}>Next</ButtonV1>
          ) : (
          // <CustomWalletButton/>
          <DynamicWidget />
          )}
        </div>
      )}
    </div>
  );
};

export default Onboarding;
