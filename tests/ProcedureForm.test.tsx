import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProcedureForm } from '../src/components/domain/procedures/ProcedureForm'

describe('Issue #34 (FE-021) - Formulário de Cadastro de Procedimento', () => {
  it('renderiza os campos obrigatórios do procedimento', () => {
    render(<ProcedureForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/Nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Categoria/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tempo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument()
  })

  it('exibe erros de validação quando campos obrigatórios estão vazios ou inválidos', async () => {
    const handleSubmit = vi.fn()
    render(<ProcedureForm onSubmit={handleSubmit} />)

    fireEvent.submit(screen.getByRole('form', { name: /Formulário de procedimento/i }))

    await waitFor(() => {
      expect(screen.getByText(/O nome deve ter pelo menos 2 caracteres/i)).toBeInTheDocument()
      expect(screen.getByText(/Selecione uma categoria/i)).toBeInTheDocument()
    })

    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('permite preenchimento e submete dados válidos', async () => {
    const handleSubmit = vi.fn()
    render(<ProcedureForm onSubmit={handleSubmit} />)

    fireEvent.change(screen.getByLabelText(/Nome/i), {
      target: { value: 'Endodontia Molar' },
    })
    fireEvent.change(screen.getByLabelText(/Categoria/i), {
      target: { value: 'Cirurgia' },
    })
    fireEvent.change(screen.getByLabelText(/Tempo/i), {
      target: { value: '90' },
    })
    fireEvent.change(screen.getByLabelText(/Descrição/i), {
      target: { value: 'Tratamento de canal em dente molar' },
    })

    fireEvent.submit(screen.getByRole('form', { name: /Formulário de procedimento/i }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Endodontia Molar',
          category: 'Cirurgia',
          time: 90,
          description: 'Tratamento de canal em dente molar',
        }),
        expect.anything()
      )
    })
  })

  it('renderiza seletor de clínica quando opções de clínica são fornecidas', () => {
    const clinicOptions = [
      { value: 'clinic-1', label: 'Clínica Centro' },
      { value: 'clinic-2', label: 'Clínica Bairro' },
    ]

    render(<ProcedureForm onSubmit={vi.fn()} clinicOptions={clinicOptions} />)

    expect(screen.getByLabelText(/Clínica/i)).toBeInTheDocument()
    expect(screen.getByText('Clínica Centro')).toBeInTheDocument()
    expect(screen.getByText('Clínica Bairro')).toBeInTheDocument()
  })
})
