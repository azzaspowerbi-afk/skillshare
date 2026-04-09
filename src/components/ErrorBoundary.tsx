import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Ocorreu um erro inesperado na sua jornada.";
      let errorDetails = "";

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = `Erro de Permissão: ${parsed.operationType} em ${parsed.path}`;
            errorDetails = parsed.error;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-game-bg flex items-center justify-center p-4">
          <div className="game-card p-8 max-w-lg w-full text-center space-y-6 border-red-500/30 bg-red-500/5">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
              <AlertCircle size={40} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Falha Crítica no Sistema</h2>
              <p className="text-slate-400 font-medium">{errorMessage}</p>
              {errorDetails && (
                <div className="mt-4 p-3 bg-black/40 rounded-lg text-left">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Detalhes Técnicos</p>
                  <p className="text-xs font-mono text-red-300/70 break-all">{errorDetails}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button 
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
              >
                <RefreshCw size={18} />
                <span>Recarregar</span>
              </button>
              <button 
                onClick={() => window.location.href = "/"}
                className="flex items-center justify-center gap-2 px-6 py-3 game-button-primary"
              >
                <Home size={18} />
                <span>Início</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
