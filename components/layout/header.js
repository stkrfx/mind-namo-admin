import { auth } from "@/auth";
import { UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-6 shadow-sm">
      {/* Left Side: Mobile Menu Trigger could go here, or Page Title */}
      <div className="flex items-center font-semibold text-lg">
        {/* Placeholder for dynamic breadcrumb if needed */}
      </div>

      {/* Right Side: Admin Profile */}
      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-none">{user?.name || "Admin"}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        
        <Link href="/settings" className="relative h-10 w-10 overflow-hidden rounded-full border hover:ring-2 hover:ring-primary/20 transition-all">
          {user?.image ? (
             <Image 
               src={user.image} 
               alt={user.name || "Admin"}
               fill
               className="object-cover"
               referrerPolicy="no-referrer" // Important for Google Images
             />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <UserCircle className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}