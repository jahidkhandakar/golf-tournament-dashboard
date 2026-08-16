import { Link } from 'react-router-dom'

export default function Logo({ className }: { className?: string }) {
    return (
        <Link to="/" className="flex items-center">
            <img
                src="/golfimprove-logo.png"
                alt="GolfImprove Logo"
                className={`size-20 w-auto object-contain ${className || ''}`}
            />
        </Link>
    )
}
