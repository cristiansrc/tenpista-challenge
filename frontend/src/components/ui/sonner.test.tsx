import { render, screen } from "@testing-library/react";
import { Toaster } from "./sonner";

const sonnerSpy = vi.fn();

vi.mock("sonner", () => ({
  Toaster: (props: unknown) => {
    sonnerSpy(props);
    return <div>mock-sonner</div>;
  },
}));

describe("ui Toaster", () => {
  it("passes default themed options to sonner toaster", () => {
    render(<Toaster position="top-right" closeButton />);

    expect(screen.getByText("mock-sonner")).toBeInTheDocument();
    expect(sonnerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: "system",
        className: "toaster group",
        position: "top-right",
        closeButton: true,
      })
    );
  });
});
