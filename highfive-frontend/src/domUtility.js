function getElementValueById(id) {
    let fromInput = document.getElementById(id);

    return fromInput.value;
}

export { getElementValueById };