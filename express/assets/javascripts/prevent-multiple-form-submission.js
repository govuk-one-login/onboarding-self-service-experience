const submitButton = document.getElementById("submit");

document.querySelectorAll("form").forEach(form => {
    form.addEventListener("submit", e => {
        if (form.classList.contains("submitting")) {
            e.preventDefault();
        }
        form.classList.add("submitting");
        submitButton.setAttribute("aria-disabled", "true");
        submitButton.setAttribute("disabled", "disabled");
        submitButton.classList.add("govuk-button--disabled");
    });
});
