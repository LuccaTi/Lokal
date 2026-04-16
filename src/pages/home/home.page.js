import "./home.css";
import quotesBackgroundImg from "./assets/images/quotes-background.jpg";
import foregroundBackgroundImg from "./assets/icons/record-svgrepo-com.svg";

const homePage = {
    createHomePage() {

        const home = document.createElement('div');
        home.classList.add('home-main-content');

        const createDetailsDiv = () => {
            const details = document.createElement('div');
            details.classList.add('details');

            const detailsH2 = document.createElement('h2');
            detailsH2.textContent = 'Organização.'

            const detailsP1 = document.createElement('p');
            detailsP1.textContent = 'Bem vindo ao Lokal, o web app de organização de tarefas mais usado na galáxia.'

            const detailsP2 = document.createElement('p');
            detailsP2.textContent = 'Utilizando local storage, todos os projetos e tarefas ficam armazenados no navegador para sempre estarem disponíveis.'

            const detailsP3 = document.createElement('p');
            detailsP3.textContent = 'Faça login e aproveite as funcionalidades da dashboard e organize todos os seus trabalhos.'

            const getStartedButton = document.createElement('button');
            getStartedButton.setAttribute('id', 'details-get-started-button');
            getStartedButton.textContent = 'Get Started';

            details.append(detailsH2, detailsP1, detailsP2, detailsP3, getStartedButton);
            return details;
        }

        const details = createDetailsDiv();

        const createQuoteDiv = (quote, author) => {
            const div = document.createElement('div');
            div.classList.add('quote');

            const p1 = document.createElement('p');
            p1.textContent = `"${quote}"`;
            const p2 = document.createElement('p');
            p2.classList.add('quote-author');
            p2.textContent = `- ${author}`;

            div.append(p1, p2);
            return div;
        }

        const foregroundWrapper = document.createElement('div');
        foregroundWrapper.setAttribute('id', 'foreground-wrapper');
        const foregroundImage = document.createElement('img');
        foregroundImage.setAttribute('id', 'foreground-image');
        foregroundImage.src = foregroundBackgroundImg;
        foregroundImage.alt = 'Lokal logo';
        foregroundWrapper.append(foregroundImage);

        const quotesBackground = document.createElement('img');
        quotesBackground.setAttribute('id', 'quotes-background');
        quotesBackground.src = quotesBackgroundImg;
        quotesBackground.alt = 'White waves background';
        const figure = document.createElement('figure');
        figure.setAttribute('id', 'figure-quotes-background');
        const caption = document.createElement('figcaption');
        const link = document.createElement('a');
        link.href = 'https://www.freepik.com/author/arrandera/3#uuid=5c8a01ec-2158-41f2-89aa-9421390226a1';
        link.target = '_blank';
        link.textContent = 'Arrandera';
        link.classList.add('image-credits-link');
        caption.append(`Image by `, link);
        
        const quotes = document.createElement('div');
        quotes.classList.add('all-quotes');
        const firstQuote = createQuoteDiv('Simples, e super poderoso', 'Gill Bates');
        const secondQuote = createQuoteDiv('O melhor app que já vi!', 'Tinus Lorvalds');
        const thirdQuote = createQuoteDiv('Sério, não sabem o que estão perdendo!', 'Zark Muckerberg');
        quotes.append(firstQuote, secondQuote, thirdQuote);

        figure.append(quotesBackground, quotes, caption);

        home.append(details, foregroundWrapper, figure);
        return home;
    }
}

export { homePage };