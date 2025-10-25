
import React from 'react';
import { type Scan } from '../types';
import { CloseIcon, TrashIcon } from './IconComponents';

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    history: Scan[];
    onLoadScan: (scanId: string) => void;
    onDeleteScan: (scanId: string) => void;
    onClearAll: () => void;
}

const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " yıl önce";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " ay önce";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " gün önce";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " saat önce";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " dakika önce";
    return "az önce";
};


export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onLoadScan, onDeleteScan, onClearAll }) => {
    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            ></div>
            <aside
                className={`fixed top-0 left-0 h-full w-full max-w-xs sm:w-80 sm:max-w-none bg-[#313131] shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    <header className="flex items-center justify-between p-3 sm:p-4 border-b border-[#e2e2e2]/20">
                        <h2 className="text-xl font-semibold text-[#e2e2e2]">Geçmiş Taramalar</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                            <CloseIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </header>

                    {history.length > 0 ? (
                        <>
                            <div className="flex-1 overflow-y-auto p-1 sm:p-2 space-y-1 sm:space-y-2">
                                {history.map((scan) => (
                                    <div
                                        key={scan.id}
                                        className="group flex items-center p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                                        onClick={() => onLoadScan(scan.id)}
                                    >
                                        <img src={scan.imageUrl} alt="Scan thumbnail" className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-full mr-3" />
                                        <div className="flex-1">
                                            <p className="text-base text-[#e2e2e2] truncate">Tarama</p>
                                            <p className="text-xs text-[#e2e2e2]/60">{timeAgo(scan.timestamp)}</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteScan(scan.id);
                                            }}
                                            className="ml-2 p-2 rounded-full text-red-400/70 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-opacity"
                                            aria-label="Delete scan"
                                        >
                                            <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                             <footer className="p-3 sm:p-4 border-t border-[#e2e2e2]/20">
                                <button
                                    onClick={onClearAll}
                                    className="w-full flex items-center justify-center p-2 bg-red-800/40 text-red-300 rounded-lg hover:bg-red-800/60 transition-colors"
                                >
                                    <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    Tüm Geçmişi Temizle
                                </button>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-4">
                            <p className="text-center text-[#e2e2e2]/60">Henüz bir tarama yapmadınız.</p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};
