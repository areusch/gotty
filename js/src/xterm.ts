import { IDisposable, Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { lib } from "libapps"

export class Xterm {
    elem: HTMLElement;
    term: Terminal;
    termFit: FitAddon;
    resizeListener: () => void;
    decoder: lib.UTF8Decoder;

    message: HTMLElement;
    messageTimeout: number;
    messageTimer: number;

    toDispose: IDisposable[];

    constructor(elem: HTMLElement) {
        this.toDispose = [];

        this.elem = elem;
        this.term = new Terminal({
            macOptionIsMeta: true,
        });
        this.termFit = new FitAddon();
        this.term.loadAddon(this.termFit);

        this.toDispose.push(this.term);

        if (elem.ownerDocument == null) {
           throw "element is not included in any document!";
        }
        this.message = elem.ownerDocument.createElement("div");
        this.message.className = "xterm-overlay";
        this.messageTimeout = 2000;

        this.resizeListener = () => {
            this.termFit.fit();
            this.term.scrollToBottom();
            this.showMessage(String(this.term.cols) + "x" + String(this.term.rows), this.messageTimeout);
        };

        this.term.open(elem);
        this.termFit.fit();
        this.term.focus();
        window.addEventListener("resize", this.resizeListener);

        this.decoder = new lib.UTF8Decoder()
    };

    info(): { columns: number, rows: number } {
        return { columns: this.term.cols, rows: this.term.rows };
    };

    output(data: string) {
        this.term.write(this.decoder.decode(data));
    };

    showMessage(message: string, timeout: number) {
        this.message.textContent = message;
        this.elem.appendChild(this.message);

        if (this.messageTimer) {
            clearTimeout(this.messageTimer);
        }
        if (timeout > 0) {
            this.messageTimer = setTimeout(() => {
                this.elem.removeChild(this.message);
            }, timeout);
        }
    };

    removeMessage(): void {
        if (this.message.parentNode == this.elem) {
            this.elem.removeChild(this.message);
        }
    }

    setWindowTitle(title: string) {
        document.title = title;
    };

    setPreferences(value: object) {
    };

    onInput(callback: (input: string) => void) {
        this.toDispose.push(this.term.onData(callback));
    };

    onResize(callback: (colmuns: number, rows: number) => void) {
        this.toDispose.push(this.term.onResize((data) => {
             callback(data.cols, data.rows);
        }));
    };

    deactivate(): void {
        this.term.blur();
    }

    reset(): void {
        this.removeMessage();
        this.term.clear();
    }

    close(): void {
        window.removeEventListener("resize", this.resizeListener);
        for (let i = this.toDispose.length - 1; i >= 0; i--) {
            this.toDispose[i].dispose();
        }
    }
}
