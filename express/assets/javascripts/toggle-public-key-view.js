const publicKeyContainer = document.getElementById("publicKeyContainer");
const togglePublicKey = document.getElementById("togglePublicKey");
const buttonText = document.getElementById("buttonText");
const publicKeyShort = document.getElementById("publicKeyShort");
const publicKeyLong = document.getElementById("publicKeyLong");
const toggleTextChevron = document.getElementById("toggleTextChevron");

togglePublicKey.addEventListener("click", showFullKey);

function showFullKey() {
    if (publicKeyContainer.className === "open") {
        publicKeyContainer.className = "";
        toggleTextChevron.className = "govuk-accordion-nav__chevron govuk-accordion-nav__chevron--down";
        buttonText.innerHTML = "Show the full public key";
        publicKeyShort.style.display = "block";
        publicKeyLong.style.display = "none";
    } else {
        publicKeyContainer.className = "open";
        toggleTextChevron.className = "govuk-accordion-nav__chevron";
        buttonText.innerHTML = "Hide the full public key";
        publicKeyShort.style.display = "none";
        publicKeyLong.style.display = "block";
    }
}
