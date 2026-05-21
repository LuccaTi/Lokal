export function formatDateForButton(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate.getTime() === today.getTime()) {
        return ' Hoje';
    } 
    const optionsFormat = { day: 'numeric', month: 'short', year: 'numeric' };
    return ` ${targetDate.toLocaleDateString('pt-BR', optionsFormat)}`;
}