import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import * as XLSX from 'xlsx';
import { Save, RefreshCw, Plus, Filter, CreditCard, BarChart2, Settings, Landmark, PlusCircle, Search, Download, Trash2, Edit } from 'lucide-react';

const Investment = () => {
  const { t } = useLanguage();

  // 환경변수에서 시트 설정 로드
  const sheetConfig = React.useMemo(() => {
    try {
      const configStr = import.meta.env.VITE_GOOGLE_SHEET_CONFIG;
      if (configStr) {
        return JSON.parse(configStr);
      }
      return [];
    } catch (e) {
      console.error("Failed to parse sheet config", e);
      return [];
    }
  }, []);

  // 탭 상태: 'list' | 'add' | 'accounts_list' | 'accounts_add' | 'settings'
  const [activeTab, setActiveTab] = useState('list');

  // 설정 (기본값 로드)
  const [sheetId, setSheetId] = useState(localStorage.getItem('sheet_id') || '');
  const [clientEmail, setClientEmail] = useState(import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL || '');
  const [privateKey, setPrivateKey] = useState(import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '');

  // 뷰 상태 (데이터, 필터, 정렬 유지)
  // 계좌 관리용 필터 키 추가 (account_type, account_name, account_company)
  const defaultFilters = {
    startDate: '',
    endDate: '',
    category: 'all',
    searchName: '',
    account_type: 'all',
    account_name: '',
    account_company: ''
  };
  const defaultSort = { key: null, direction: null };

  const [viewState, setViewState] = useState({
    list: {
      data: [],
      originalData: [],
      filters: { ...defaultFilters },
      sortConfig: { ...defaultSort },
      pagination: { currentPage: 1, itemsPerPage: 10 }
    },
    accounts_list: {
      data: [],
      originalData: [],
      filters: { ...defaultFilters },
      sortConfig: { ...defaultSort },
      pagination: { currentPage: 1, itemsPerPage: 10 }
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 동적 입력 폼 상태 (탭 전환 시 초기화)
  const [newItem, setNewItem] = useState({});
  // 인라인 추가 폼 상태 (계좌관리용)
  const [isInlineAdding, setIsInlineAdding] = useState(false);

  // 수정 모드 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // 현재 활성화된 화면의 키 구하기 (list 혹은 accounts_list)
  const currentViewKey = activeTab === 'accounts_list' ? 'accounts_list' : 'list';

  // 뷰 상태 접근 헬퍼
  const currentData = viewState[currentViewKey]?.data || [];
  const currentFilters = viewState[currentViewKey]?.filters || defaultFilters;
  const currentSort = viewState[currentViewKey]?.sortConfig || defaultSort;
  const currentPagination = viewState[currentViewKey]?.pagination || { currentPage: 1, itemsPerPage: 10 };

  // 페이지네이션 계산
  const totalItems = currentData.length;
  const totalPages = Math.ceil(totalItems / currentPagination.itemsPerPage);
  const startIndex = (currentPagination.currentPage - 1) * currentPagination.itemsPerPage;
  const endIndex = startIndex + currentPagination.itemsPerPage;
  const paginatedData = currentData.slice(startIndex, endIndex);

  // 현재 활성화된 시트 설정 가져오기
  const getCurrentSheetConfig = () => {
    if (activeTab === 'list' || activeTab === 'add') {
      return sheetConfig.find(c => c.id === 'INVESTMENT');
    } else if (activeTab === 'accounts_list' || activeTab === 'accounts_add') {
      return sheetConfig.find(c => c.id === 'ACCOUNTS');
    }
    return null;
  };

  const currentConfig = getCurrentSheetConfig();

  // 설정 저장
  const handleSaveSettings = () => {
    localStorage.setItem('sheet_id', sheetId);
    alert(t.settingsSaved);
  };

  // 뷰 상태 업데이트 헬퍼
  // (Not used directly but concept remains)

  // 데이터 로드
  const loadData = async () => {
    // 설정 탭에서는 로드 안함
    if (activeTab === 'settings' || !currentConfig) return;

    if (!sheetId || !clientEmail || !privateKey) {
      setError(t.allSettings);
      return;
    }

    setLoading(true);
    setError(null);

    // 필터 정리 (불필요한 키 제거해서 보내기 등) - backend가 알아서 걸러냄

    try {
      const apiUrl = import.meta.env.DEV
        ? 'http://localhost:3001/api/sheets/data'
        : '/.netlify/functions/sheets-data';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId,
          clientEmail,
          privateKey,
          filters: currentFilters,
          sheetName: currentConfig.sheetName
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || t.dataLoadError);
      }

      const result = await response.json();

      // 데이터 업데이트 및 정렬 초기화
      setViewState(prev => ({
        ...prev,
        [currentViewKey]: {
          ...prev[currentViewKey],
          data: result.data,
          originalData: result.data,
          sortConfig: { key: null, direction: null },
          pagination: { ...prev[currentViewKey].pagination, currentPage: 1 } // 데이터 로드 시 1페이지로 리셋
        }
      }));

    } catch (err) {
      console.error('Frontend error:', err);
      setError(err.message || t.dataLoadError);
    } finally {
      setLoading(false);
    }
  };

  // 탭 변경 시 입력 폼만 초기화 (데이터, 필터는 유지)
  // 탭 변경 시 입력 폼만 초기화 (데이터, 필터는 유지)
  useEffect(() => {
    setNewItem({});
    setError(null);
    setIsInlineAdding(false);
    setIsEditMode(false);
    setEditId(null);
  }, [activeTab]);

  // 필터 변경 핸들러
  const handleFilterChange = (key, value) => {
    setViewState(prev => ({
      ...prev,
      [currentViewKey]: {
        ...prev[currentViewKey],
        filters: {
          ...prev[currentViewKey].filters,
          [key]: value
        }
      }
    }));
  };

  // 필터 적용 (조회 버튼)
  const applyFilters = () => {
    setViewState(prev => ({
      ...prev,
      [currentViewKey]: {
        ...prev[currentViewKey],
        pagination: { ...prev[currentViewKey].pagination, currentPage: 1 }
      }
    }));
    loadData();
  };

  // 필터 초기화
  const resetFilters = () => {
    setViewState(prev => ({
      ...prev,
      [currentViewKey]: {
        ...prev[currentViewKey],
        filters: { ...defaultFilters },
        pagination: { ...prev[currentViewKey].pagination, currentPage: 1 }
      }
    }));
    setTimeout(() => {
      loadData();
    }, 0);
  };

  // 정렬 핸들러 (Asc -> Desc -> Max(Default) 로테이션)
  const requestSort = (key) => {
    let direction = 'ascending';

    // 현재 정렬 상태 확인
    if (currentSort.key === key) {
      if (currentSort.direction === 'ascending') {
        direction = 'descending';
      } else if (currentSort.direction === 'descending') {
        direction = null; // 초기화
      }
    }

    let sortedData;
    const baseData = viewState[currentViewKey]?.originalData || [];

    if (direction === null) {
      // 초기 순서(originalData)로 복구
      sortedData = [...baseData];
    } else {
      // originalData 기준으로 정렬 수행
      sortedData = [...baseData].sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (!isNaN(Number(valA)) && !isNaN(Number(valB)) && valA !== '' && valB !== '') {
          valA = Number(valA);
          valB = Number(valB);
        }

        if (valA < valB) return direction === 'ascending' ? -1 : 1;
        if (valA > valB) return direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    setViewState(prev => ({
      ...prev,
      [currentViewKey]: {
        ...prev[currentViewKey],
        sortConfig: { key: direction ? key : null, direction },
        data: sortedData,
        pagination: { ...prev[currentViewKey].pagination, currentPage: 1 } // 정렬 시 1페이지로 (선택사항)
      }
    }));
  };

  // 데이터 추가/수정
  const addData = async () => {
    if (!currentConfig) return;

    const isUpdate = isEditMode && editId;
    const itemsEndpoint = isUpdate ? 'update' : 'add';
    const method = isUpdate ? 'PUT' : 'POST';

    const apiUrl = import.meta.env.DEV
      ? `http://localhost:3001/api/sheets/${itemsEndpoint}`
      : `/.netlify/functions/sheets-${itemsEndpoint}`;

    try {
      const bodyPayload = {
        sheetId,
        clientEmail,
        privateKey,
        item: newItem,
        sheetName: currentConfig.sheetName
      };

      if (isUpdate) {
        bodyPayload.uuid = editId;
      }

      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        throw new Error(isUpdate ? t.dataAddError : t.dataAddError); // Use generic error or specific
      }

      alert(isUpdate ? '수정되었습니다.' : t.dataAddedSuccess);
      setNewItem({});
      setIsEditMode(false);
      setEditId(null);

      if (activeTab === 'add') {
        setActiveTab('list');
      } else if (activeTab === 'accounts_list' || activeTab === 'list') {
        // 목록 화면(계좌, 투자내역)에서 인라인 추가/수정 시
        loadData();
        // 인라인 폼 닫기
        setIsInlineAdding(false);
      } else if (activeTab === 'accounts_add') {
        setActiveTab('accounts_list');
      }

    } catch (err) {
      alert(err.message);
    }
  };

  // 삭제 핸들러
  const handleDelete = async (row) => {
    const id = row.id || row.ID || row.Id || row.uuid || row.UUID;
    if (!id) {
      alert('삭제할 데이터의 고유 ID(A열)를 찾을 수 없습니다.\n시트의 A1 셀이 "id"로 설정되어 있는지 확인해주세요.');
      return;
    }

    if (!confirm('정말 삭제하시겠습니까?')) return;

    const apiUrl = import.meta.env.DEV
      ? 'http://localhost:3001/api/sheets/delete'
      : '/.netlify/functions/sheets-delete';

    try {
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId,
          clientEmail,
          privateKey,
          sheetName: currentConfig.sheetName,
          uuid: id
        }),
      });

      if (!response.ok) {
        throw new Error('삭제 실패');
      }

      alert('삭제되었습니다.');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // 수정 핸들러
  const handleEdit = (row) => {
    const id = row.id || row.ID || row.Id || row.uuid || row.UUID;
    if (!id) {
      alert('수정할 데이터의 고유 ID(A열)를 찾을 수 없습니다.\n시트의 A1 셀이 "id"로 설정되어 있는지 확인해주세요.');
      return;
    }

    setNewItem({ ...row }); // 복사
    setIsEditMode(true);
    setEditId(id);
    setIsInlineAdding(true); // 인라인 폼 열기 (모든 리스트 뷰 공통)
  };
  // 엑셀 다운로드 핸들러
  const handleDownloadExcel = () => {
    if (!currentConfig || currentData.length === 0) {
      alert(t.noData);
      return;
    }

    // 데이터 변환 (헤더를 한글/영문 라벨로 적용)
    const exportData = currentData.map(row => {
      const rowData = {};
      currentConfig.columns.forEach(col => {
        const header = t[col.labelKey] || col.labelKey;
        // 값 포맷팅 (선택사항: 엑셀에서 숫자/텍스트 처리)
        // 여기서는 원본 값을 그대로 넣되, 필요시 가공
        rowData[header] = row[col.key];
      });
      return rowData;
    });

    // 워크시트 생성
    const ws = XLSX.utils.json_to_sheet(exportData);

    // 워크북 생성 및 시트 추가
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // 파일명 생성
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = activeTab === 'list' ? '투자내역' : '계좌목록';
    const fileName = `${prefix}_${dateStr}.xlsx`;

    // 다운로드 실행
    XLSX.writeFile(wb, fileName);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setViewState(prev => ({
      ...prev,
      [currentViewKey]: {
        ...prev[currentViewKey],
        pagination: { ...prev[currentViewKey].pagination, currentPage: newPage }
      }
    }));
  };

  // 페이지당 항목 수 변경 핸들러
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = Number(e.target.value);
    setViewState(prev => ({
      ...prev,
      [currentViewKey]: {
        ...prev[currentViewKey],
        pagination: { currentPage: 1, itemsPerPage: newItemsPerPage }
      }
    }));
  };

  const handleInputChange = (key, value) => {
    setNewItem(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 lg:p-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2 font-heading">{t.investmentManagement}</h1>
        <p className="text-gray-500">{t.investmentDescription}</p>
      </header>

      {/* 탭 메뉴 (Top Navigation) */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-700 pb-1">
        <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'list' ? 'bg-[var(--primary)] text-white font-medium' : 'text-gray-500 hover:text-[var(--primary)] hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
          <BarChart2 size={18} /> {t.investmentList}
        </button>
        <button onClick={() => setActiveTab('add')} className={`px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'add' ? 'bg-[var(--primary)] text-white font-medium' : 'text-gray-500 hover:text-[var(--primary)] hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
          <PlusCircle size={18} /> {t.addInvestment}
        </button>
        <div className="w-px h-8 bg-gray-300 mx-1 self-center hidden sm:block"></div>
        <button onClick={() => setActiveTab('accounts_list')} className={`px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'accounts_list' ? 'bg-[var(--primary)] text-white font-medium' : 'text-gray-500 hover:text-[var(--primary)] hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
          <CreditCard size={18} /> {t.accountList}
        </button>
        <div className="flex-grow"></div>
        <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'settings' ? 'bg-gray-700 text-white font-medium' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
          <Settings size={18} /> {t.connectionSettings}
        </button>
      </div>

      {/* 설정 탭 View */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in">
          <h2 className="text-xl font-bold mb-4 text-[var(--text-main)]">{t.connectionSettings}</h2>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.spreadsheetId}</label>
              <input type="text" value={sheetId} onChange={(e) => setSheetId(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--text-main)]" placeholder="ID" />
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200">{t.autoConfigured}</div>
            <button onClick={handleSaveSettings} className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Save size={18} /> {t.saveSettings}
            </button>
          </div>
        </div>
      )}

      {/* 목록 조회 탭 (List View) */}
      {(activeTab === 'list' || activeTab === 'accounts_list') && (
        <div className="space-y-6 animate-fade-in">
          {/* 필터 섹션 */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Filter size={18} /> {t.filterConditions}
              </span>

              {/* --- 1. 투자내역조회 필터 --- */}
              {activeTab === 'list' && (
                <>
                  <div className="flex items-center gap-2">
                    <input type="date" value={currentFilters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} className="p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                    <span className="text-gray-400">~</span>
                    <input type="date" value={currentFilters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} className="p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                  </div>
                  {/* 카테고리 필터 */}
                  {currentConfig?.columns.find(c => c.key === 'category') && (
                    <select value={currentFilters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                      <option value="all">{t.all}</option>
                      {currentConfig.columns.find(c => c.key === 'category').options?.map(opt => (
                        <option key={opt} value={opt}>{t[opt] || opt}</option>
                      ))}
                    </select>
                  )}
                  {/* 종목명 검색 */}
                  <div className="relative flex-grow max-w-xs">
                    <input type="text" value={currentFilters.searchName} onChange={(e) => handleFilterChange('searchName', e.target.value)} placeholder={t.searchByName} className="w-full p-2 pl-3 pr-8 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                    <Search className="absolute right-2 top-2.5 text-gray-400" size={16} />
                  </div>
                </>
              )}

              {/* --- 2. 계좌관리 필터 (요청사항반영) --- */}
              {activeTab === 'accounts_list' && (
                <>
                  {/* 계좌 유형 (account_type) */}
                  {currentConfig?.columns.find(c => c.key === 'account_type') && (
                    <select value={currentFilters.account_type} onChange={(e) => handleFilterChange('account_type', e.target.value)} className="p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 min-w-[120px]">
                      <option value="all">전체 유형</option>
                      {currentConfig.columns.find(c => c.key === 'account_type').options?.map(opt => (
                        <option key={opt} value={opt}>{t[opt] || opt}</option>
                      ))}
                    </select>
                  )}

                  {/* 계좌명 (account_name) */}
                  <div className="relative flex-grow max-w-[200px]">
                    <input type="text" value={currentFilters.account_name} onChange={(e) => handleFilterChange('account_name', e.target.value)} placeholder="계좌명 검색" className="w-full p-2 pl-3 pr-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                  </div>

                  {/* 금융기관 (account_company) */}
                  <div className="relative flex-grow max-w-[200px]">
                    <input type="text" value={currentFilters.account_company} onChange={(e) => handleFilterChange('account_company', e.target.value)} placeholder="금융기관 검색" className="w-full p-2 pl-3 pr-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                  </div>
                </>
              )}

              <div className="flex gap-2 ml-auto">
                <button onClick={applyFilters} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                  <RefreshCw size={16} /> {t.search}
                </button>
                <button onClick={resetFilters} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 transition-colors whitespace-nowrap">
                  {t.reset}
                </button>
                <button onClick={handleDownloadExcel} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap">
                  <Download size={16} /> 엑셀 다운로드
                </button>
                {activeTab === 'accounts_list' && (
                  <button onClick={() => setIsInlineAdding(!isInlineAdding)} className="px-4 py-2 bg-[var(--primary)] text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    {isInlineAdding ? <filter size={16} /> : <Plus size={16} />} {isEditMode ? '수정 취소' : '항목추가'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (<div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">{error}</div>)}

          {/* 인라인 항목 추가 폼 (계좌관리 & 투자내역 수정 공용) */}
          {((activeTab === 'accounts_list' || activeTab === 'list') && isInlineAdding) && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700 animate-slide-down">
              <h3 className="text-lg font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
                {isEditMode ? <Edit size={20} className="text-[var(--primary)]" /> : <PlusCircle size={20} className="text-[var(--primary)]" />}
                {isEditMode
                  ? (activeTab === 'list' ? '투자내역 수정' : '계좌 정보 수정')
                  : (activeTab === 'list' ? '투자내역 추가' : '계좌 정보 추가')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4 items-end">
                {currentConfig?.columns.map(col => (
                  <div key={col.key} className={col.key === 'note' ? 'col-span-1 md:col-span-3 lg:col-span-6' : ''}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t[col.labelKey] || col.labelKey}</label>
                    {col.type === 'select' ? (
                      <select value={newItem[col.key] || ''} onChange={(e) => handleInputChange(col.key, e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--text-main)] focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">Select...</option>
                        {col.options.map(opt => (<option key={opt} value={opt}>{t[opt] || opt}</option>))}
                      </select>
                    ) : (
                      <input type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'} value={newItem[col.key] || ''} onChange={(e) => handleInputChange(col.key, e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--text-main)] focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={t[col.labelKey] || col.labelKey} />
                    )}
                  </div>
                ))}

                {/* Action Buttons Integrated into Grid */}
                <div className="flex gap-2 lg:col-span-1">
                  <button onClick={() => { setIsInlineAdding(false); setIsEditMode(false); setEditId(null); setNewItem({}); }} className="px-4 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 transition-colors whitespace-nowrap">
                    닫기
                  </button>
                  <button onClick={addData} className={`px-4 py-2.5 ${isEditMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[var(--primary)] hover:bg-indigo-700'} text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap`}>
                    {isEditMode ? <Edit size={16} /> : <Plus size={16} />} {isEditMode ? '수정' : '추가'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 데이터 테이블 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                Loading...
              </div>
            ) : currentData.length === 0 ? (
              <div className="p-12 text-center text-gray-500">{t.noData}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                      {currentConfig?.columns.map(col => (
                        <th key={col.key} className="p-4 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => requestSort(col.key)}>
                          <div className="flex items-center gap-1">
                            {t[col.labelKey] || col.labelKey}
                            {currentSort.key === col.key && (<span className="text-xs">{currentSort.direction === 'ascending' ? '▲' : '▼'}</span>)}
                          </div>
                        </th>
                      ))}
                      <th className="p-4 font-semibold text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        {currentConfig?.columns.map(col => (
                          <td key={col.key} className="p-4 text-sm text-[var(--text-main)]">
                            {(() => {
                              const val = row[col.key];
                              if (col.type === 'number') return Number(val).toLocaleString();
                              if (col.type === 'select') return (<span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}>{val}</span>);
                              return val || '-';
                            })()}
                          </td>
                        ))}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(row)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="수정">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(row)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="삭제">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 페이지네이션 컨트롤 */}
            {!loading && currentData.length > 0 && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Show</span>
                  <select
                    value={currentPagination.itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-gray-500">items per page</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="mr-2 text-gray-500">
                    {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPagination.currentPage - 1)}
                      disabled={currentPagination.currentPage === 1}
                      className="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Prev
                    </button>
                    {/* 간단한 페이지 번호 표시 (1..N) - 너무 많으면 생략 로직 필요하나 일단 전체 표시 */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // 현재 페이지 주변 5개 보여주기 로직 (간단하게 1~5만 보여주는건 아님)
                      // 여기서는 간단히 전체 페이지 중 일부만 보여주거나, select로 이동하게 하는게 나음.
                      // 일단은 Prev/Next만 있어도 되지만, 숫자 버튼 몇개 추가.
                      let p = i + 1;
                      if (totalPages > 5) {
                        if (currentPagination.currentPage > 3) p = currentPagination.currentPage - 2 + i;
                        if (p > totalPages) p = p - (p - totalPages);
                        // 복잡하니 여기서는 심플하게 갈게요: Current Page 표시만.
                      }
                      return null;
                    })}
                    <span className="px-2 font-medium text-[var(--text-main)]">
                      Page {currentPagination.currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPagination.currentPage + 1)}
                      disabled={currentPagination.currentPage === totalPages}
                      className="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 데이터 추가 탭 (Add View - Investment only) */}
      {(activeTab === 'add') && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-full animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <PlusCircle className="text-[var(--primary)]" />
              {isEditMode ? (activeTab === 'add' ? '투자내역 수정' : '계좌정보 수정') : (activeTab === 'add' ? t.addNewItem : t.addAccount)}
            </h2>
            <button onClick={addData} className={`px-6 py-2 ${isEditMode ? 'bg-blue-600' : 'bg-[var(--primary)]'} text-white font-bold rounded-lg hover:opacity-90 transition-transform active:scale-[0.98] shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2`}>
              {isEditMode ? <Edit size={20} /> : <Plus size={20} />} {isEditMode ? '수정하기' : t.addButton}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {currentConfig?.columns.map(col => (
              <div key={col.key} className={col.key === 'note' ? 'col-span-1 md:col-span-3 lg:col-span-5' : ''}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t[col.labelKey] || col.labelKey}</label>
                {col.type === 'select' ? (
                  <select value={newItem[col.key] || ''} onChange={(e) => handleInputChange(col.key, e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--text-main)] focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                    <option value="">Select...</option>
                    {col.options.map(opt => (<option key={opt} value={opt}>{t[opt] || opt}</option>))}
                  </select>
                ) : (
                  <input type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'} value={newItem[col.key] || ''} onChange={(e) => handleInputChange(col.key, e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--text-main)] focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder={t[col.labelKey] || col.labelKey} />
                )}
              </div>
            ))}
            {/* Button moved to header */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Investment;
