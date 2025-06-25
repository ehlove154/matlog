export class Dialog {
    /** @type {HTMLElement} */
    #$element;
    /** @type {HTMLElement[]} */
    #$modals = [];

    /** @param {{$element; HTMLElement}} args */
    constructor(args) {
        this.#$element = args.$element;
    }

    /** @param {HTMLElement} $modal */
    hide = ($modal) => {
        const index = this.#$modals.indexOf($modal);
        if (index < 0) {
            return;
        }
        this.#$modals.splice(index, 1);
        if (this.#$modals.length === 0) {
            this.#$element.setVisible(false);
        }
        $modal.setVisible(false);                      /* 1초 */
        setTimeout(() => $modal.remove(), 1000);
    }

    /** @param {{title: string,
     *           content:string,
     *           isContentHtml?: boolean,
     *           delay?: number,
     *           buttons: {
     *                      caption:string,
     *                      color?:'gray'|'green'|'red',
     *                      onClickCallback: function(HTMLElement)}[]}} args */
    show = (args) => {
        const $modal = document.createElement('div');
        $modal.setAttribute(`data-mt-component`, `dialog.modal`);
        const $title = document.createElement(`div`);
        $title.setAttribute(`data-mt-component`, `dialog.modal.title`);
        $title.innerText = args.title;
        const $content = document.createElement(`div`);
        $content.setAttribute(`data-mt-component`, `dialog.modal.content`);

        if (args.isContentHtml === true) {
            $content.innerHTML = args.content;
        } else {
            $content.innerHTML = args.content;
        }
        const $buttonContainer = document.createElement(`div`);
        $buttonContainer.setAttribute(`data-mt-component`, `dialog.modal.buttonContainer`);
        $buttonContainer.append(...args.buttons.map((button) => {
            const $button = document.createElement(`button`);
            $button.addEventListener(`click`, () => button.onClickCallback($modal));
            $button.setAttribute(`data-mt-object`, `button`);
            $button.setAttribute(`data-mt-component`, `dialog.modal.buttonContainer.button`);
            $button.setAttribute(`data-mt-color`, button.color ?? `gray`);
            $button.innerHTML = button.caption;
            return $button;
        }));
        $modal.append($title, $content, $buttonContainer);
        this.#$element.append($modal);
        this.#$element.setVisible(true);
        this.#$modals.push($modal);
        setTimeout(() => $modal.setVisible(true), args.delay ?? 25);
        return $modal;
    }


    /** @param {string} title
     * @param {string} content
     * @param {{delay?: number, isContentHtml?:boolean, onClickCallback?: function(HTMLElement)}?} args */
    showSimpleOk = (title, content, args = {}) => {
        return this.show({
            title: title,
            content: content,
            delay: args?.delay,
            isContentHtml: args?.isContentHtml,
            buttons: [
                {
                    caption: `확인`,
                    color:`green`,
                    onClickCallback: ($modal) => {
                        this.hide($modal);
                        args?.onClickCallback?.($modal); // ~?.() 는 선행하는 피연산자가 있으면 호출하겠다는 의미
                    }
                }
            ]
        })
    }
}