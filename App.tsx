
import React, { useState, useRef, useEffect } from 'react';
import { type TableData, type Scan } from './types';
import { extractTableFromImage } from './services/geminiService';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { HistoryPanel } from './components/HistoryPanel';
import { RefreshIcon, TrashIcon, ExcelIcon, SaveIcon } from './components/IconComponents';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';


const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

const App: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [tableData, setTableData] = useState<TableData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
    const [scanHistory, setScanHistory] = useState<Scan[]>([]);
    const [currentScanId, setCurrentScanId] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);
    const progressIntervalRef = useRef<number | null>(null);

     useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('scanHistory');
            if (storedHistory) {
                setScanHistory(JSON.parse(storedHistory));
            }
        } catch (e) {
            console.error("Failed to parse scan history from localStorage", e);
            setScanHistory([]);
        }
    }, []);

    const saveHistory = (updatedHistory: Scan[]) => {
        setScanHistory(updatedHistory);
        localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
    };


    if (!process.env.API_KEY) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center font-sans text-[#e2e2e2] bg-[#313131] p-4">
                <div className="w-full max-w-md bg-red-900/60 p-8 rounded-2xl shadow-lg border border-red-700 text-center">
                    <h1 className="text-2xl font-bold text-red-200 mb-4">Hata</h1>
                    <p className="text-red-200">
                        API_KEY ortam değişkeni yapılandırılmamış. Uygulama AI servisiyle iletişim kuramaz.
                    </p>
                    <p className="text-red-300 mt-4 text-sm">
                        Lütfen dağıtım ayarlarınızda API anahtarını yapılandırdığınızdan emin olun.
                    </p>
                </div>
            </div>
        );
    }

    const resetState = () => {
        setImageFile(null);
        if (imageUrl && imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imageUrl);
        }
        setImageUrl(null);
        setTableData(null);
        setIsLoading(false);
        setError(null);
        setProgress(0);
        setCurrentScanId(null);
        setHasUnsavedChanges(false);
        setShowSaveSuccess(false);
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleExtract = async (fileToProcess: File) => {
        if (!fileToProcess) {
            setError("Dosya ile ilgili bir sorun oluştu. Lütfen tekrar deneyin.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setTableData(null);
        setProgress(0);

        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }

        const startTime = Date.now();
        const targetProgress = 99;
        const timeConstant = 5000;

        progressIntervalRef.current = window.setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const newProgress = targetProgress * (1 - Math.exp(-elapsedTime / timeConstant));
            
            setProgress(prev => {
                const updatedProgress = Math.floor(Math.min(targetProgress, newProgress));
                return Math.max(prev, updatedProgress);
            });
        }, 100);


        try {
            const data = await extractTableFromImage(fileToProcess);
            if (data && data.length > 0) {
              setTableData(data);
              const dataUrl = await fileToDataUrl(fileToProcess);
              const newScan: Scan = {
                  id: uuidv4(),
                  timestamp: Date.now(),
                  imageUrl: dataUrl,
                  tableData: data,
              };
              saveHistory([newScan, ...scanHistory]);
              setCurrentScanId(newScan.id);
              setHasUnsavedChanges(false);

            } else {
              setError("Tablo verisi çıkarılamadı. Görüntü net bir tablo içermiyor olabilir veya format desteklenmiyor.");
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Veri çıkarma sırasında bilinmeyen bir hata oluştu.";
            setError(errorMessage);
        } finally {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
            setProgress(100);
            
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }
    };
    
    const handleFileChange = (file: File) => {
        if (file) {
            resetState(); 
            setImageFile(file);
            const newImageUrl = URL.createObjectURL(file);
            setImageUrl(newImageUrl);
            handleExtract(file);
        }
    };

    const handleDataChange = (rowIndex: number, colIndex: number, value: string) => {
        if (!tableData) return;
        const newData = tableData.map((row, rIdx) => {
            if (rIdx === rowIndex) {
                return row.map((cell, cIdx) => (cIdx === colIndex ? value : cell));
            }
            return row;
        });
        setTableData(newData);
        setHasUnsavedChanges(true);
    };

    const handleSaveChanges = () => {
        if (!currentScanId || !hasUnsavedChanges || !tableData) return;

        const updatedHistory = scanHistory.map(scan => {
            if (scan.id === currentScanId) {
                return {
                    ...scan,
                    tableData: tableData,
                    timestamp: Date.now(),
                };
            }
            return scan;
        });

        saveHistory(updatedHistory);
        setHasUnsavedChanges(false);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
    };

    const downloadAsXLSX = () => {
        if (!tableData) return;

        const worksheet = XLSX.utils.aoa_to_sheet(tableData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, "extracted_data.xlsx");
    };

    const loadScanFromHistory = (scanId: string) => {
        const scanToLoad = scanHistory.find(s => s.id === scanId);
        if (scanToLoad) {
            resetState();
            setImageUrl(scanToLoad.imageUrl);
            setTableData(scanToLoad.tableData);
            setCurrentScanId(scanId);
            setHasUnsavedChanges(false);
            setIsHistoryPanelOpen(false);
        }
    };

    const deleteScanFromHistory = (scanId: string) => {
        if (scanId === currentScanId) {
            resetState();
        }
        const updatedHistory = scanHistory.filter(s => s.id !== scanId);
        saveHistory(updatedHistory);
    };

    const clearHistory = () => {
        saveHistory([]);
        setIsHistoryPanelOpen(false);
    };


    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="w-full max-w-lg text-center flex flex-col justify-center items-center min-h-[30vh] sm:min-h-[42vh] p-4">
                    <p className="text-[64px] sm:text-[80px] font-normal tracking-tight text-[#e2e2e2] drop-shadow-md tabular-nums">
                        {Math.floor(progress)}%
                    </p>
                    <div className="w-1/3 bg-black/20 rounded-full h-2.5 mt-2">
                        <div 
                            className="bg-[#e2e2e2] h-2.5 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="w-full max-w-md bg-red-900/60 p-6 sm:p-8 rounded-2xl shadow-lg border border-red-700 text-center">
                    <h2 className="text-lg sm:text-xl font-bold text-red-200 mb-4">Bir Hata Oluştu</h2>
                    <p className="text-red-200">{error}</p>
                    <button 
                        onClick={resetState}
                        className="mt-4 sm:mt-6 flex items-center justify-center w-full p-2 sm:p-3 bg-red-600/50 text-white/90 rounded-xl shadow-sm hover:bg-red-600/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#313131] focus:ring-red-500 transition-colors text-base sm:text-lg font-normal"
                    >
                        <RefreshIcon className="w-5 h-5 mr-2" />
                        Tekrar Dene
                    </button>
                </div>
            );
        }

        if (tableData) {
            return (
                 <div className="w-full max-w-full sm:max-w-5xl text-center space-y-4 sm:space-y-6 relative">
                    {showSaveSuccess && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mt-[-1rem] bg-green-500/80 text-white px-4 py-2 rounded-md shadow-lg z-50">
                            Değişiklikler kaydedildi!
                        </div>
                    )}
                    {imageUrl && (
                        <div className="w-full my-4 bg-black/10 rounded-xl shadow-md border-2 border-dashed border-[#e2e2e2]/40 overflow-hidden">
                            <img src={imageUrl} alt="Uploaded content" className="w-full max-h-60 sm:max-h-96 object-cover object-top" />
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                        <button
                            onClick={downloadAsXLSX}
                            className="flex items-center justify-center w-full p-3 sm:p-4 bg-black/10 text-[#e2e2e2]/90 rounded-xl shadow-sm hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#313131] focus:ring-blue-500 transition-colors text-base sm:text-xl font-normal border-2 border-dashed border-[#e2e2e2]/40"
                        >
                            <ExcelIcon className="w-5 h-5 mr-2" />
                            Excel Olarak İndir
                        </button>
                         <button
                            onClick={handleSaveChanges}
                            disabled={!hasUnsavedChanges}
                            className="flex items-center justify-center w-full p-3 sm:p-4 bg-black/10 text-green-400/90 rounded-xl shadow-sm hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#313131] focus:ring-green-500 transition-colors text-base sm:text-xl font-normal border-2 border-dashed border-[#e2e2e2]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-500"
                        >
                            <SaveIcon className="w-5 h-5 mr-2" />
                            Değişiklikleri Kaydet
                        </button>
                        <button
                            onClick={resetState}
                            className="flex items-center justify-center w-full p-3 sm:p-4 bg-black/10 text-red-400/90 rounded-xl shadow-sm hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#313131] focus:ring-red-500 transition-colors text-base sm:text-xl font-normal border-2 border-dashed border-[#e2e2e2]/40"
                        >
                           <TrashIcon className="w-5 h-5 mr-2" />
                           Sıfırla
                        </button>
                    </div>
                    <DataTable data={tableData} onDataChange={handleDataChange} />
                </div>
            );
        }
        
        return <FileUpload onFileChange={handleFileChange} onHistoryClick={() => setIsHistoryPanelOpen(true)} />;
    };

    return (
        <div className="min-h-screen bg-[#313131] text-[#e2e2e2] font-sans flex flex-col">
             <HistoryPanel
                isOpen={isHistoryPanelOpen}
                onClose={() => setIsHistoryPanelOpen(false)}
                history={scanHistory}
                onLoadScan={loadScanFromHistory}
                onDeleteScan={deleteScanFromHistory}
                onClearAll={clearHistory}
            />
            <main className="w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
                {renderContent()}
            </main>
            <footer className="w-full py-3 sm:py-4 flex justify-center items-center">
                 <p className="text-base text-[#e2e2e2]/70 text-center px-4">
                    Verileriniz cihazınızda tutulur uygulama veri depolamaz.
                </p>
            </footer>
        </div>
    );
};

export default App;
