export default function Loading({ title }: { title?: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <h1 className="text-sm  md:text-base mt-5 font-semibold">{title}</h1>
        </div>
    );
}