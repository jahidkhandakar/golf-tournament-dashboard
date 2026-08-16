import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { FaInstagram, FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Logo from "../logo/index.js";

export default function Footer() {
  // link data
  const footerData = [
    {
      title: "About us",
      data: [
        { id: 1, title: "Home", href: "/" },
        { id: 2, title: "Blog", href: "#blog" },
        { id: 3, title: "Contact", href: "#contact" },
        { id: 4, title: "Why Choose Us", href: "#why-choose-us" },
      ]
    },
    {
      title: "Services",
      data: [
        { id: 1, title: "Monetize", href: "#monetize" },
        { id: 2, title: "Advertise", href: "#advertise" },
        { id: 3, title: "Tour Support", href: "#tour-support" },
        { id: 4, title: "Api Integration", href: "#api-integration" },
      ],
    },
    {
      title: "Others",
      data: [
        { id: 1, title: "Cookies", href: "/cookies" },
        { id: 2, title: "Privacy Policy", href: "/privacy-policy" },
        { id: 3, title: "Terms & Conditions", href: "/terms-conditions" },
      ],
    }
  ]
  // for logo icons
  const iconsData = [
    { id: 1, href: "#facebook", icon: <FaFacebookF size={18} /> },
    { id: 2, href: "#linkedin", icon: <FaLinkedinIn size={18} /> },
    { id: 3, href: "#twitter", icon: <FaXTwitter size={18} /> },
    { id: 4, href: "#instagram", icon: <FaInstagram size={18} /> },
  ];
  return (
    <div className=" text-black dark:text-[#C7C7C7] w-full h-auto mx-h-[387px] pt-24 pb-6">
      <div className=" custom-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-center gap-10">
          <div>
            {/* logo  */}
            <div>
              <Logo />
              <p className="text-[16px] mt-3 text-black dark:text-[#C7C7C7]">Explore our platform&apos;s features and see how we can help boost your productivity with a guided tour.</p>
            </div>
            <div className="flex gap-5 mt-14">
              {iconsData?.map((item) => {
                return (
                  <Link
                    to={item?.href}
                    key={item?.id}
                    className="w-8 h-8 p-2 border border-rose-600 hover:bg-rose-600 dark:text-white hover:text-white [transition:0.5s] rounded-full flex items-center justify-center"
                  >
                    <span>{item?.icon}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          {/* about us  */}
          {
            footerData?.map((item, index) => (
              <div key={index}>
                <h3 className="text-[1.5rem] font-semibold uppercase text-black dark:text-white mb-5">
                  {item?.title}
                </h3>
                <div className="flex flex-col gap-3">
                  {item?.data?.map((nav) => {
                    return (
                      <div key={nav?.id}>
                        <Link
                          to={nav?.href}
                          className="hover:text-rose-600 [transition:0.5s] text-[16px]"
                        >
                          {nav?.title}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          }

        </div>
        <div className="mt-10">
          <div className="w-full rounded-full h-[1px] bg-gray-500" ></div>
          <p className="text-[14px] text-center pt-6 text-gray-800 dark:text-gray-400">
            Tour. 2024. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
