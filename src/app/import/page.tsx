"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { ChevronLeft, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { generateJSON } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

interface ParsedArticle {
  title: string;
  content: string; // TipTap JSON format
  createdAt: number;
  icon?: string;
  originalHtml?: string; // Original HTML from Notion
}

export default function ImportPage() {
  return <ImportContent />;
}

function ImportContent() {
  const router = useRouter();
  const batchImport = useMutation(api.articles.batchImportArticles);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [parsedCount, setParsedCount] = useState(0);

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const parseNotionExport = useCallback(async (files: FileList): Promise<ParsedArticle[]> => {
    const articles: ParsedArticle[] = [];
    const fileArray = Array.from(files);
    
    // Find the CSV file for metadata
    const csvFile = fileArray.find(f => f.name.endsWith('.csv'));
    const metadata: Map<string, { created: number }> = new Map();
    
    if (csvFile) {
      const csvText = await csvFile.text();
      const lines = csvText.split('\n');
      
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Parse CSV line properly - Title, Created, Edited, Tags
        const fields = parseCSVLine(line);
        if (fields.length >= 2) {
          const title = fields[0].trim();
          const createdStr = fields[1].trim();
          const createdDate = new Date(createdStr);
          if (!isNaN(createdDate.getTime())) {
            // Store with normalized title (remove trailing punctuation and spaces)
            const normalizedTitle = title.replace(/[.\s]+$/, '');
            metadata.set(normalizedTitle, { created: createdDate.getTime() });
          }
        }
      }
    }
    
    // Process HTML files (skip index files that are database listings)
    const htmlFiles = fileArray.filter(f => {
      if (!f.name.endsWith('.html')) return false;
      // Skip the main database index file (contains table view, not actual content)
      // These typically have long hex IDs and match the CSV filename pattern
      const baseNameWithoutExt = f.name.replace('.html', '');
      const csvFileName = csvFile?.name.replace('.csv', '');
      // Skip if this HTML file name matches the CSV file name (it's the index)
      if (csvFileName && baseNameWithoutExt === csvFileName) return false;
      return true;
    });
    
    for (const file of htmlFiles) {
      const html = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract title from <h1 class="page-title">
      const titleElement = doc.querySelector('h1.page-title');
      const title = titleElement?.textContent?.trim() || 'Untitled';
      
      // Extract content from <div class="page-body">
      const contentElement = doc.querySelector('div.page-body');
      const originalHtml = contentElement?.innerHTML || '<p></p>';
      
      // Convert HTML to TipTap JSON format
      const tiptapJson = generateJSON(originalHtml, [StarterKit]);
      const content = JSON.stringify(tiptapJson);
      
      // Normalize title for lookup (remove trailing punctuation and spaces)
      const normalizedTitle = title.replace(/[.\s]+$/, '');
      
      // Get creation time from metadata or use current time
      const createdAt = metadata.get(normalizedTitle)?.created || Date.now();
      
      articles.push({
        title,
        content, // TipTap JSON format
        createdAt,
        icon: "FileText", // Default icon for imported articles
        originalHtml, // Preserve original HTML from Notion
      });
    }
    
    return articles;
  }, []);

  const handleFiles = useCallback(async (files: FileList) => {
    setIsProcessing(true);
    setStatus("idle");
    setMessage("");
    
    try {
      // Parse all files
      const articles = await parseNotionExport(files);
      setParsedCount(articles.length);
      
      if (articles.length === 0) {
        setStatus("error");
        setMessage("No valid articles found in the upload. Make sure to upload HTML files from a Notion export.");
        setIsProcessing(false);
        return;
      }
      
      // Import to Convex
      const result = await batchImport({ articles });
      
      if (result.success) {
        setStatus("success");
        setMessage(`Successfully imported ${result.count} article${result.count === 1 ? '' : 's'}! Redirecting...`);
        
        // Redirect after 800ms
        setTimeout(() => {
          router.push("/");
        }, 800);
      }
    } catch (error) {
      console.error("Import error:", error);
      setStatus("error");
      setMessage("Failed to import articles. Please check the file format and try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [batchImport, parseNotionExport, router]);

  const getAllFiles = async (dataTransferItemList: DataTransferItemList): Promise<File[]> => {
    const files: File[] = [];
    
    const readEntry = async (entry: FileSystemEntry): Promise<void> => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        return new Promise((resolve) => {
          fileEntry.file((file) => {
            files.push(file);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const dirReader = dirEntry.createReader();
        return new Promise((resolve) => {
          dirReader.readEntries(async (entries) => {
            for (const entry of entries) {
              await readEntry(entry);
            }
            resolve();
          });
        });
      }
    };

    const items = Array.from(dataTransferItemList);
    for (const item of items) {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        await readEntry(entry);
      }
    }
    
    return files;
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.items) {
      // Use DataTransferItemList to handle folders
      const files = await getAllFiles(e.dataTransfer.items);
      if (files.length > 0) {
        const fileList = new DataTransfer();
        files.forEach(file => fileList.items.add(file));
        handleFiles(fileList.files);
      }
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="text-gray-400 hover:text-white transition-colors flex items-center"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Import from Notion</h1>
          <p className="text-gray-400">
            Upload your Notion HTML export to import all your articles
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-all
            ${isDragging ? 'border-white bg-white/5' : 'border-gray-700 hover:border-gray-600'}
            ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
            onChange={handleFileInput}
            className="hidden"
            disabled={isProcessing}
          />
          
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-4"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-white" />
            ) : (
              <Upload size={48} className="text-gray-400" />
            )}
            
            <div>
              <p className="text-lg mb-2">
                {isProcessing ? "Processing files..." : "Drop Notion export folder here"}
              </p>
              <p className="text-sm text-gray-400">
                or click to select folder
              </p>
              {parsedCount > 0 && isProcessing && (
                <p className="text-sm text-gray-500 mt-2">
                  Found {parsedCount} articles...
                </p>
              )}
            </div>
          </label>
        </div>

        {status !== "idle" && (
          <div
            className={`
              mt-6 p-4 rounded-lg flex items-center gap-3
              ${status === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}
            `}
          >
            {status === "success" ? (
              <CheckCircle size={24} className="flex-shrink-0" />
            ) : (
              <AlertCircle size={24} className="flex-shrink-0" />
            )}
            <p>{message}</p>
          </div>
        )}

        <div className="mt-8 p-6 bg-white/5 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText size={20} />
            How to export from Notion
          </h2>
          <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
            <li>Open your Notion database</li>
            <li>Click the &quot;...&quot; menu in the top right</li>
            <li>Select &quot;Export&quot;</li>
            <li>Choose &quot;HTML&quot; as the export format</li>
            <li>Make sure to check &quot;Include subpages&quot;</li>
            <li>Click &quot;Export&quot; and wait for the download</li>
            <li>Unzip the downloaded file</li>
            <li>Drag the entire unzipped folder here (or click to select it)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

