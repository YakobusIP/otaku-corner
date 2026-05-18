import SlideUpInView from "@/components/motion/SlideUpInView";

export default function GeneralFooter() {
  return (
    <SlideUpInView
      as="footer"
      className="border-t border-rose-100/70 bg-white py-7 text-center text-sm text-[#786879]"
    >
      &copy; {new Date().getFullYear()} Otaku Corner. All rights reserved.
    </SlideUpInView>
  );
}
