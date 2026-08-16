export default function Title({ title, subTitle, className }: { title: string, subTitle: string, className: string }) {
  return (
    <div className={`my-12 ${className}`}>
      <span className="text-[2rem] seaweed-script text-[#FFC42E] block">{title}</span>
      <h1 className='md:text-[1.3rem] lg:text-[2.9rem] font-bold leading-normal text-black'>{subTitle}</h1>
    </div>
  )
}
