import { render, screen } from "@testing-library/react";
import LoginPage from "@/pages/login/index";

vi.mock("@/components/refine-ui/form/sign-in-form", () => ({
  SignInForm: () => <div>mock-sign-in-form</div>,
}));

describe("LoginPage", () => {
  it("renders SignInForm", () => {
    render(<LoginPage />);
    expect(screen.getByText("mock-sign-in-form")).toBeInTheDocument();
  });
});

