import { Link, NavLink } from 'react-router-dom'

export default function UserProfile({ user }: { user: any }) {
  const handleLogOut = () => {
    console.log("user log out")
  }
  return (
    <div className="lg:flex">
      <div className="dropdown dropdown-left items-center md:order-2 rtl:space-x-reverse">
        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
            {user ? (
              <img src={user?.photoURL} alt="User" />
            ) : (
              <img src="https://i.ibb.co/Xb7MwCk/placeholder.jpg" alt="Placeholder" />
            )}
          </div>
        </label>
        <ul
          tabIndex={0}
          className="mt-3 z-[1] text-start shadow dropdown-content space-y-1 bg-base-100 rounded-box w-48 p-3"
        >
          <Link to={"/admin/dashboard"}>
            <li>
              <button className="mt-5 flex mx-auto bg-transparent hover:bg-red-600 text-red-600 font-serif font-semibold hover:text-white py-1 md:py-2 px-2 md:px-4 border hover:border-transparent rounded">
                Dashboard
              </button>
            </li>
          </Link>
          <li className="font-base text-base">Offer Announcements</li>
          <li>
            <h1 className="font-base text-base">{user ? user?.displayName : "Your Name"}</h1>
          </li>
          <li>
            <h1 className="font-base text-base">{user ? user?.email : "Your Email"}</h1>
          </li>
          {user ? (
            <button
              onClick={handleLogOut}
              className="font-base flex mx-auto font-serif text-lg text-rose-600"
            >
              LogOut
            </button>
          ) : (
            <li className="font-base text-base">
              <NavLink to="/login">Login</NavLink>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
