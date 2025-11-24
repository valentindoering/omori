"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ManageNotionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Database {
  id: string;
  title: string;
  icon?: string;
}

export function ManageNotionDialog({ isOpen, onClose }: ManageNotionDialogProps) {
  const notionConnection = useQuery(api.notion.getConnection);
  const disconnectNotion = useMutation(api.notion.disconnectNotion);
  const createState = useMutation(api.notionOAuthState.createState);
  const fetchDatabases = useAction(api.notionApi.fetchDatabases);
  const selectDatabase = useMutation(api.notion.selectDatabase);

  const [databases, setDatabases] = useState<Database[]>([]);
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(false);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string>("");
  const [isSavingDatabase, setIsSavingDatabase] = useState(false);

  // Fetch databases when dialog opens and user is connected
  useEffect(() => {
    if (isOpen && notionConnection) {
      setIsLoadingDatabases(true);
      fetchDatabases()
        .then((dbs) => {
          setDatabases(dbs);
          // Set current selection if exists
          if (notionConnection.selectedDatabaseId) {
            setSelectedDatabaseId(notionConnection.selectedDatabaseId);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch databases:", error);
        })
        .finally(() => {
          setIsLoadingDatabases(false);
        });
    }
  }, [isOpen, notionConnection, fetchDatabases]);

  const handleConnect = async () => {
    const clientId = process.env.NEXT_PUBLIC_NOTION_OAUTH_CLIENT_ID;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    
    if (!clientId || !convexUrl) {
      alert("Notion OAuth is not configured");
      return;
    }

    try {
      // Create a state token to maintain user context through OAuth flow
      const state = await createState();

      // Convert .cloud to .site for HTTP endpoints
      const httpUrl = convexUrl.replace('.convex.cloud', '.convex.site');
      
      // Build OAuth URL - redirect to Convex HTTP endpoint with state
      const redirectUri = `${httpUrl}/notion/callback`;
      const oauthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      // Redirect to Notion OAuth
      window.location.href = oauthUrl;
    } catch (error) {
      console.error("Failed to create OAuth state:", error);
      alert("Failed to initiate Notion connection. Please try again.");
    }
  };

  const handleDisconnect = async () => {
    if (confirm("Are you sure you want to disconnect your Notion account?")) {
      await disconnectNotion();
    }
  };

  const handleSaveDatabase = async () => {
    if (!selectedDatabaseId || !notionConnection) return;

    setIsSavingDatabase(true);
    try {
      const selectedDb = databases.find((db) => db.id === selectedDatabaseId);
      if (selectedDb) {
        await selectDatabase({
          databaseId: selectedDb.id,
          databaseName: selectedDb.title,
        });
      }
    } catch (error) {
      console.error("Failed to save database selection:", error);
    } finally {
      setIsSavingDatabase(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <DialogTitle className="text-lg font-semibold text-white">
              Notion Connection
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {notionConnection ? (
              // Connected state
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  {notionConnection.workspaceIcon && (
                    <div className="flex-shrink-0">
                      {notionConnection.workspaceIcon.startsWith('http') ? (
                        <img 
                          src={notionConnection.workspaceIcon} 
                          alt="Workspace icon"
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="text-4xl">
                          {notionConnection.workspaceIcon}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-400">Connected</span>
                    </div>
                    <h3 className="text-lg font-medium text-white truncate">
                      {notionConnection.workspaceName || "Notion Workspace"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Connected on {new Date(notionConnection._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">
                    Select Database
                  </label>
                  <p className="text-sm text-gray-400 -mt-2">
                    Choose a database to save your articles to Notion
                  </p>
                  
                  {isLoadingDatabases ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      <span className="ml-2 text-sm text-gray-400">Loading databases...</span>
                    </div>
                  ) : databases.length > 0 ? (
                    <div className="space-y-3">
                      <select
                        value={selectedDatabaseId}
                        onChange={(e) => setSelectedDatabaseId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="" className="bg-zinc-900">
                          Select a database...
                        </option>
                        {databases.map((db) => (
                          <option key={db.id} value={db.id} className="bg-zinc-900">
                            {db.icon && `${db.icon} `}{db.title}
                          </option>
                        ))}
                      </select>
                      
                      {selectedDatabaseId && (
                        <button
                          onClick={handleSaveDatabase}
                          disabled={isSavingDatabase || selectedDatabaseId === notionConnection.selectedDatabaseId}
                          className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSavingDatabase ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving...
                            </>
                          ) : selectedDatabaseId === notionConnection.selectedDatabaseId ? (
                            "✓ Selected"
                          ) : (
                            "Save Selection"
                          )}
                        </button>
                      )}
                      
                      {notionConnection.selectedDatabaseName && (
                        <p className="text-sm text-green-500">
                          Current: {notionConnection.selectedDatabaseName}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No databases found in your workspace.</p>
                  )}
                </div>

                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-medium text-white">About this connection</h4>
                  <p className="text-sm text-gray-400">
                    This connection allows you to import pages from your Notion workspace
                    and save articles back to Notion. You can disconnect at any time.
                  </p>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="w-full px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium transition-colors"
                >
                  Disconnect Notion
                </button>
              </div>
            ) : (
              // Not connected state
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .841-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .841-1.168.841l-3.222.186c-.093-.186 0-.652.326-.746l.838-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Connect to Notion
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Connect your Notion workspace to import your pages and notes.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-medium text-white">What you can do:</h4>
                  <ul className="space-y-1.5 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Import pages from your Notion workspace</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Keep your notes in sync</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Disconnect anytime</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleConnect}
                  className="w-full px-4 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition-colors"
                >
                  Connect Notion
                </button>

                <p className="text-xs text-gray-500 text-center">
                  We&apos;ll ask for permission to access your Notion workspace
                </p>
              </div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

