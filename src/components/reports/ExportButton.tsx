import { Copy, Download } from "lucide-react";

export function ExportButton({ markdown }: { markdown: string }) {
  const copy = async () => navigator.clipboard.writeText(markdown);
  const download = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bionexus-parkinsons-report.md";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex flex-wrap gap-2">
      <button className="nexus-button" onClick={copy}>
        <Copy className="h-4 w-4" />
        Copy markdown
      </button>
      <button className="nexus-button-secondary" onClick={download}>
        <Download className="h-4 w-4" />
        Export .md
      </button>
      <button className="nexus-button-secondary" onClick={() => window.print()}>
        Print
      </button>
    </div>
  );
}
