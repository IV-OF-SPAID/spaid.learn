import qrApp from "/qr.png";

const QrCom = () => {
  return (
    <div className="w-full flex flex-col px-4 md:px-20 pt-5 gap-5 ">
      <div className="w-full max-w-[880px] h-auto md:h-[170px] bg-[#D1F6FF] rounded-2xl p-4 flex flex-col md:flex-row items-center mx-auto ">
        <div className="w-32 h-32 border-1 border-[rgba(0,0,0,0.25)] overflow-hidden flex justify-center items-center mx-auto md:mx-0">
          <img src={qrApp} alt="QR Code" className="w-full h-full object-fit" />
        </div>
        <div className="h-full px-0 md:px-5 py-3 w-full md:w-100 flex flex-col items-center md:items-start">
          <h1 className="text-lg text-center md:text-left">
            Learn anywhere with SPAIDLEARN Mobile
          </h1>
          <h1 className="text-[#403F3F] text-center md:text-left">
            Learning courses available offline
          </h1>
        </div>
        <div className="h-full flex justify-center md:justify-end items-end w-full md:w-100 mt-2 md:mt-0">
          <a href="#" className="text-[#403F3F] text-sm">
            Scan the QR code to get the app
          </a>
        </div>
      </div>
    </div>
  );
};

export default QrCom;
