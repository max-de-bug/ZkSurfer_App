"use client";

const ButtonV3 = ({
  children,
  func,
}: {
  children: React.ReactNode;
  func: () => void;
}) => {
  return (
    <div
      onClick={() => func()}
      className="transition-all ease-in-out duration-200 block w-full overflow-hidden   active:translate-y-0  hover:bg-white hover:text-white active:text-white p-[1px]"
      style={{
        clipPath:
          " polygon(0% 0%, calc(100% - 12px) 0%, 100% 12px, 100% 100%, 12px 100%, 0% calc(100% - 12px), 0% 100%, 0% 0%)",
      }}
    >
      <div
        className="px-3 py-3 text-center cursor-pointer text-black bg-white font-semibold hover:bg-zkBackground hover:text-white"
        style={{
          clipPath:
            " polygon(0% 0%, calc(100% - 12px) 0%, 100% 12px, 100% 100%, 12px 100%, 0% calc(100% - 12px), 0% 100%, 0% 0%)",
        }}
      >
        {children}
      </div>
    </div>
  );
};
export default ButtonV3;
