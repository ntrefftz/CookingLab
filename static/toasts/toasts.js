// toast.js
export class Toast {
    static container = null;
  
    static init() {
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        document.body.appendChild(this.container);
      }
    }
  
    static show(message, type = 'info', duration = 3000) {
      this.init();
  
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
  
      this.container.appendChild(toast);
  
      setTimeout(() => {
        toast.classList.add('fade-out');
      }, duration);
  
      setTimeout(() => {
        toast.remove();
      }, duration + 500); // extra para la animación
    }
  }