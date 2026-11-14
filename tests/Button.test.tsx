import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../src/components/ui/Button";

describe("Button", () => {
  it("renderiza o texto recebido", () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("executa a ação ao ser clicado", () => {
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Salvar</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("fica desabilitado durante o carregamento", () => {
    render(<Button isLoading>Salvando</Button>);

    expect(screen.getByRole("button", { name: "Salvando" })).toBeDisabled();
  });
});
