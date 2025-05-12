import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Seller_signup from "../src/Pages/seller/seller_signup/Seller_signup";

// Mock react-router-dom
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

// Mock @react-google-maps/api
vi.mock("@react-google-maps/api", () => ({
  GoogleMap: ({ children, onClick }) => (
    <div data-testid="mock-map" onClick={() => onClick({ latLng: { lat: () => 6.9271, lng: () => 79.8612 } })}>
      {children}
    </div>
  ),
  Marker: () => <div data-testid="mock-marker" />,
  useLoadScript: () => ({
    isLoaded: true,
    loadError: null,
  }),
}));

// Helper functions for random data
const generateRandomString = () => Math.random().toString(36).substring(2, 10);
const generateRandomEmail = () => `${generateRandomString()}@example.com`;
const generateRandomPhone = () =>
  Math.floor(1000000000 + Math.random() * 9000000000).toString();

describe("Seller_signup Component", () => {
  it("should show validation errors for missing fields", () => {
    render(
      <MemoryRouter>
        <Seller_signup />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/signup/i));

    expect(screen.getByText(/company name is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/email is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/address is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/phone number is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/please select a location on the map\./i)).toBeInTheDocument();
    expect(screen.getByText(/description is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/password is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/please upload a company logo\./i)).toBeInTheDocument();
  });

  it("should show an error for invalid email format", () => {
    render(
      <MemoryRouter>
        <Seller_signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/company email/i), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(screen.getByText(/signup/i));

    expect(screen.getByText(/invalid email address\./i)).toBeInTheDocument();
  });

  it("should show an error if image is not uploaded", () => {
    render(
      <MemoryRouter>
        <Seller_signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/company name/i), {
      target: { value: generateRandomString() },
    });
    fireEvent.change(screen.getByPlaceholderText(/company email/i), {
      target: { value: generateRandomEmail() },
    });
    fireEvent.change(screen.getByPlaceholderText(/company address/i), {
      target: { value: generateRandomString() },
    });
    fireEvent.change(screen.getByPlaceholderText(/valid telephone number/i), {
      target: { value: generateRandomPhone() },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter a small description/i), {
      target: { value: generateRandomString() },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("mock-map"));

    fireEvent.click(screen.getByText(/signup/i));

    expect(screen.getByText(/please upload a company logo\./i)).toBeInTheDocument();
  });

  it("should show an error if phone number is not provided", () => {
    render(
      <MemoryRouter>
        <Seller_signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/company name/i), {
      target: { value: generateRandomString() },
    });
    fireEvent.change(screen.getByPlaceholderText(/company email/i), {
      target: { value: generateRandomEmail() },
    });
    fireEvent.change(screen.getByPlaceholderText(/company address/i), {
      target: { value: generateRandomString() },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter a small description/i), {
      target: { value: generateRandomString() },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("mock-map"));

    fireEvent.click(screen.getByText(/signup/i));

    expect(screen.getByText(/phone number is required\./i)).toBeInTheDocument();
  });

  it("should show an error if password is not provided", () => {
    render(
      <MemoryRouter>
        <Seller_signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/company name/i), {
      target: { value: generateRandomString() },
    });
    fireEvent.change(screen.getByPlaceholderText(/company email/i), {
      target: { value: generateRandomEmail() },
    });
    fireEvent.change(screen.getByPlaceholderText(/company address/i), {
      target: { value: generateRandomString() },
    });
    fireEvent.change(screen.getByPlaceholderText(/valid telephone number/i), {
      target: { value: generateRandomPhone() },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter a small description/i), {
      target: { value: generateRandomString() },
    });
    fireEvent.click(screen.getByTestId("mock-map"));

    fireEvent.click(screen.getByText(/signup/i));

    expect(screen.getByText(/password is required\./i)).toBeInTheDocument();
  });

  it("should show an error for password less than 6 characters", () => {
    render(
      <MemoryRouter>
        <Seller_signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/company name/i), {
      target: { value: generateRandomString() },
    });
    fireEvent.change(screen.getByPlaceholderText(/company email/i), {
      target: { value: generateRandomEmail() },
    });
    fireEvent.change(screen.getByPlaceholderText(/company address/i), {
      target: { value: generateRandomString() },
    });
    fireEvent.change(screen.getByPlaceholderText(/valid telephone number/i), {
      target: { value: generateRandomPhone() },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter a small description/i), {
      target: { value: generateRandomString() },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByTestId("mock-map"));

    fireEvent.click(screen.getByText(/signup/i));

    expect(screen.getByText(/password must be at least 6 characters\./i)).toBeInTheDocument();
  });

  it("should show an error for description exceeding 100 characters", () => {
    render(
      <MemoryRouter>
        <Seller_signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter a small description/i), {
      target: { value: "a".repeat(101) },
    });
    fireEvent.click(screen.getByText(/signup/i));

    expect(screen.getByText(/description cannot exceed 100 characters\./i)).toBeInTheDocument();
  });

  it("should show an error for invalid phone number", () => {
    render(
      <MemoryRouter>
        <Seller_signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/valid telephone number/i), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByText(/signup/i));

    expect(screen.getByText(/enter a valid phone number\./i)).toBeInTheDocument();
  });
});