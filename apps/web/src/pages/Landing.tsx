import { ROUTES } from "@shared/constants";
import { buttonVariants, Link } from "@shared/ui";

import convoIcon from "../assets/convo.svg";

export default function Landing() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <img src={convoIcon} alt="Convo" className="h-14 w-14" />
          <h1 className="text-text-primary text-4xl font-bold tracking-tight">
            Convo
          </h1>
        </div>
        <p className="text-text-secondary mb-6">A secured messaging app</p>
        <div className="space-x-4">
          <Link
            to={ROUTES.LOGIN}
            variant="button"
            className={buttonVariants({ variant: "default" })}
          >
            Login
          </Link>
          <Link
            to={ROUTES.REGISTER}
            variant="button"
            className={buttonVariants({ variant: "outline" })}
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
