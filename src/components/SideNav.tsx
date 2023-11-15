import { Home, LogIn, LogOut, UserCircle } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function SideNav() {
  const session = useSession();
  const user = session.data?.user;
  return (
    <nav className="sticky top-0 flex items-center px-4 md:pr-6">
      <ul className="flex flex-col space-y-6 pt-4">
        <li>
          <Link className="flex items-center space-x-2" href="/">
            <Home size={24} />
            <span className="hidden md:inline">Home</span>
          </Link>
        </li>
        {user && (
          <li>
            <Link
              className="flex items-center space-x-2"
              href={`/profile/${user.id}`}
            >
              <UserCircle size={24} />
              <span className="hidden md:inline">Profile</span>
            </Link>
          </li>
        )}
        {user ? (
          <li>
            <button
              className="flex items-center space-x-2"
              onClick={() => void signOut()}
            >
              <LogOut size={24} />
              <span className="hidden md:inline">Sign out</span>
            </button>
          </li>
        ) : (
          <li>
            <button
              className="flex items-center space-x-2"
              onClick={() => void signIn()}
            >
              <LogIn size={24} />
              <span className="hidden md:inline">Sign In</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
