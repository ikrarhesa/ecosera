import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err: unknown) {
    console.error(err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center bg-[#F6F8FC]">
          <div className="text-center p-6">
            <h1 className="text-2xl font-semibold text-slate-900">Terjadi masalah</h1>
            <p className="text-slate-600 mt-2">Muat ulang halaman untuk mencoba lagi.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
