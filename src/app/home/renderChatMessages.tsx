import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import ResultBlock from "@/component/ui/ResultBlock"; // Import the ResultBlock component
import { Message } from "./HomeContent";

interface RenderChatMessagesProps {
  displayMessages: Array<Message>;
  isLoading: boolean;
  processingCommand: boolean;
  handleMintNFT: (base64Image: string) => Promise<void>; // Updated to accept a parameter
  handleDownload: () => void;
  renderMessageContent: (
    message: Message
  ) => JSX.Element | JSX.Element[] | null; // Updated to accept array
  imageResultType: string | null;
  handleLaunchMemeCoin: () => void;
  isMobile: boolean;
}

const RenderChatMessages: React.FC<RenderChatMessagesProps> = ({
  displayMessages,
  isLoading,
  processingCommand,
  handleMintNFT,
  handleDownload,
  renderMessageContent,
  imageResultType,
  handleLaunchMemeCoin,
  isMobile,
}) => {
  return (
    <div>
      {/* Render chat messages */}
      {displayMessages.map((message: Message, index) => (
        <div key={index} className="mb-4 flex justify-start w-full">
          <div
            className={cn("mb-4 flex w-full", {
              "justify-end": message.role === "user",
              "justify-start": message.role !== "user",
            })}
          >
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 rounded-full bg-[#171D3D] border flex items-center justify-center">
                {message.role === "user" ? (
                  <span>U</span>
                ) : (
                  <Image
                    src="images/tiger.svg"
                    alt="logo"
                    width={40}
                    height={40}
                    className="p-2"
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center justify-between w-full mt-2">
                <span
                  className={`flex justify-between items-center text-md text-gray-400 font-sourceCode ${
                    message.role !== "user" &&
                    "bg-gradient-to-br from-zkIndigo via-zkLightPurple to-zkPurple bg-clip-text text-transparent"
                  } ${!isMobile ? `mt-0.5` : ""}`}
                >
                  {message.role === "user" ? "User" : "ZkTerminal"}
                </span>
                {message.role !== "user" && (
                  <div className="flex space-x-2">
                    <button className="text-white rounded-lg">
                      <Image
                        src="images/Download.svg"
                        alt="logo"
                        width={20}
                        height={20}
                      />
                    </button>
                    <button className="text-white rounded-lg">
                      <Image
                        src="images/share.svg"
                        alt="logo"
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>
                )}
              </div>
              {message.role === "assistant" &&
              typeof message.content === "string" &&
              message.content.startsWith("/") ? (
                <ResultBlock
                  content={message.content}
                  type="image"
                  onMintNFT={handleMintNFT}
                  onDownloadProof={handleDownload}
                  imageResultType={message.command}
                  onLaunchMemeCoin={
                    message.command === "create-agent"
                      ? handleLaunchMemeCoin
                      : undefined
                  }
                  loading={isLoading}
                />
              ) : (
                <div className="inline-block p-1 rounded-lg text-white">
                  {renderMessageContent(message)}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {isLoading &&
        (processingCommand ? (
          // Custom loader for /create-agent and /image-gen
          <ResultBlock
            type="image"
            processing={true}
            onDownloadProof={handleDownload}
            imageResultType={imageResultType}
            onMintNFT={handleMintNFT}
            onLaunchMemeCoin={handleLaunchMemeCoin}
          />
        ) : (
          // Default loader
          <div className="text-center">
            <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></span>
            <p>Processing your query. This may take up to 5 minutes...</p>
          </div>
        ))}
    </div>
  );
};

export default RenderChatMessages;
