import { imgLogoDark } from "@/lib/assets";

export function Footer() {
  return (
    <footer className="bg-[rgba(0,0,0,0.94)] px-10 py-10">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <img src={imgLogoDark} alt="Diciobase" className="h-[30px] w-auto" />
        <p className="font-['Poppins:Regular'] text-[13px] text-white/70 tracking-[-0.26px]">
          DICIOBASE @ All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
