export function validateCPF(cpf) {
    const cleanCPF = cpf.replace(/[^\d]+/g, '');

    if (cleanCPF.length !== 11 || /^(\d)\1+$/.test(cleanCPF)) {
        throw new Error('CPF inválido');
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let rest = 11 - (sum % 11);
    let digit1 = rest >= 10 ? 0 : rest;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    rest = 11 - (sum % 11);
    let digit2 = rest >= 10 ? 0 : rest;

    if (
        digit1 !== parseInt(cleanCPF.charAt(9)) ||
        digit2 !== parseInt(cleanCPF.charAt(10))
    ) {
        throw new Error('CPF inválido');
    }

    return cleanCPF;
}