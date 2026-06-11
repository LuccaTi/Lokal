export function positionOverlay(anchorElement, overlayElement) {
    const rect = anchorElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const overlayHeight = overlayElement.offsetHeight;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const margin = 8;

    let topPosition;
    if (spaceBelow >= overlayHeight + margin) {
        topPosition = rect.bottom + margin;
    } else if (spaceAbove >= overlayHeight + margin) {
        topPosition = rect.top - overlayHeight - margin;
    } else {
        topPosition = rect.bottom + margin;
    }

    let leftPosition = rect.left;
    const overlayWidth = overlayElement.offsetWidth;
    const maxLeftPosition = window.innerWidth - overlayWidth - margin;

    if (leftPosition + overlayWidth > window.innerWidth) {
        leftPosition = maxLeftPosition > 0 ? maxLeftPosition : margin;
    }

    overlayElement.style.position = 'fixed';
    overlayElement.style.top = `${topPosition}px`;
    overlayElement.style.left = `${leftPosition}px`;
    overlayElement.style.zIndex = '50';
}

export function positionEllipsisOverlay(ellipsisButton, overlayElement) {
    const rect = ellipsisButton.getBoundingClientRect();
    const viewportWidth = window.innerHeight;
    const viewportHeight = overlayElement.offsetHeight;

    const overlayWidth = overlayElement.offsetWidth;
    const overlayHeight = overlayElement.offsetHeight;
    const margin = 8;

    let topPosition = rect.top;

    if (topPosition + overlayHeight > viewportHeight - margin) {
        topPosition = rect.bottom - overlayHeight;

        if (topPosition < margin) {
            topPosition = margin;
        }
    }

    let leftPosition = rect.right + margin;

    if(leftPosition + overlayWidth > viewportWidth - margin) {
        leftPosition = rect.left - overlayWidth - margin;

        if(leftPosition < margin){
            leftPosition = viewportWidth - overlayWidth - margin;
        }
    }

    overlayElement.style.position = 'fixed';
    overlayElement.style.top = `${topPosition}px`;
    overlayElement.style.left = `${leftPosition}px`;
    overlayElement.style.zIndex = '50'; 
}
