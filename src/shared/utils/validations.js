const passwordRules = [
    { key: "minlength", regex: /.{6,}/, message: "A senha deve ter no mínimo 6 caracteres." },
    { key: "uppercase", regex: /[A-Z]/, message: "A senha deve conter pelo menos uma letra maiúscula." },
    { key: "number", regex: /(.*\d){2,}/, message: "A senha deve conter pelo menos dois números." },
    { key: "special", regex: /[!@#$%^&*()_+= -]/, message: "A senha deve conter pelo menos um caractere especial." }
]

const validator = {

    validatePassword(value) {
        const password = value.trim();
        const failedRule = passwordRules.find(rule => !rule.regex.test(password));
        return failedRule ? failedRule.message : null;
    },

    getPasswordStatus(value) {
        const password = value.trim();
        const status = {};

        passwordRules.forEach(rule => {
            status[rule.key] = rule.regex.test(password);
        });

        return status;
    }
}

export { validator };