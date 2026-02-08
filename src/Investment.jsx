import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Save, Loader, AlertTriangle, ChevronRight, ChevronLeft, Calculator, ArrowUpDown, ArrowUp, ArrowDown, Search, RotateCcw } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const Investment = () => {
  const { t } = useLanguage();
  const [sheetId, setSheetId] = useState('');
  const [clientEmail, setClientEmail] = useState(import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL || '');
  const [privateKey, setPrivateKey] = useState(import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '');
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 탭 상태
  const [activeTab, setActiveTab] = useState('list');
  
  // 필터 상태
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'all',
    searchName: ''
  });
  
  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // 정렬 상태
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  
  // 새 항목 추가 폼 상태
  const [newItem, setNewItem] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '주식',
    name: '',
    quantity: '',
    price: '',
    note: ''
  });

  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    const savedConfig = localStorage.getItem('google_sheet_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setSheetId(config.sheetId || '');
    }
  }, []);

  // 설정 저장
  const saveConfig = () => {
    localStorage.setItem('google_sheet_config', JSON.stringify({ sheetId }));
    alert(t.settingsSaved);
  };

  // 구글 시트 데이터 로드 (백엔드 API 호출)
  const loadData = async () => {
    if (!sheetId || !clientEmail || !privateKey) {
      setError(t.allSettings);
      return;
    }

    setLoading(true);
    setError(null);

    console.log('🔍 Frontend: Sending filters to backend:', filters);

    try {
      // API URL: 개발 환경 vs 프로덕션 환경
      const apiUrl = import.meta.env.DEV 
        ? 'http://localhost:3001/api/sheets/data'
        : '/.netlify/functions/sheets-data';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetId, clientEmail, privateKey, filters }),
      });

      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }

      const result = await response.json();
      console.log('✅ Frontend: Received data count:', result.data.length);
      setData(result.data);
      setOriginalData(result.data);
      setSortConfig({ key: null, direction: null });
    } catch (err) {
      console.error('❌ Frontend error:', err);
      setError(t.dataLoadError);
    } finally {
      setLoading(false);
    }
  };

  // 정렬 처리 함수
  const handleSort = (key) => {
    setCurrentPage(1);
    
    let direction = 'desc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'desc') {
        direction = 'asc';
      } else if (sortConfig.direction === 'asc') {
        setSortConfig({ key: null, direction: null });
        setData([...originalData]);
        return;
      }
    }

    const sorted = [...data].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      // 날짜 처리
      if (key === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      // 숫자 처리
      else if (key === 'quantity' || key === 'price') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }
      // 문자열 처리
      else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (direction === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    });

    setData(sorted);
    setSortConfig({ key, direction });
  };

  // 데이터 추가
  const addData = async () => {
    if (!newItem.name || !newItem.price) {
      alert(t.nameRequired);
      return;
    }

    setLoading(true);
    try {
      // API URL: 개발 환경 vs 프로덕션 환경
      const apiUrl = import.meta.env.DEV 
        ? 'http://localhost:3001/api/sheets/add'
        : '/.netlify/functions/sheets-add';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId,
          clientEmail,
          privateKey,
          item: newItem
        }),
      });

      if (!response.ok) {
        throw new Error('데이터 추가에 실패했습니다.');
      }

      await loadData();
      setNewItem({ ...newItem, name: '', quantity: '', price: '', note: '' });
      alert(t.dataAddedSuccess);
      setActiveTab('list');
    } catch (err) {
      console.error(err);
      setError(t.dataAddError);
    } finally {
      setLoading(false);
    }
  };

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: 'all',
      searchName: ''
    });
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-6 animate-fade-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            {t.investmentManagement}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.investmentDescription}</p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'list'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30'
            }`}
          >
            📊 {t.investmentList}
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'add'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30'
            }`}
          >
            ➕ {t.addInvestment}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30'
            }`}
          >
            ⚙️ {t.connectionSettings}
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="p-6">
          {/* 투자내역조회 탭 */}
          {activeTab === 'list' && (
            <div className="space-y-6">
              {/* 조회 조건 필터 */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl border border-gray-100 dark:border-gray-600">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  🔍 {t.filterConditions}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{t.startDate}</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{t.endDate}</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{t.category}</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
                    >
                      <option value="all">{t.all}</option>
                      <option value="주식">주식</option>
                      <option value="코인">코인</option>
                      <option value="부동산">부동산</option>
                      <option value="현금">현금</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{t.name}</label>
                    <input
                      type="text"
                      placeholder={t.searchByName}
                      value={filters.searchName}
                      onChange={(e) => setFilters({ ...filters, searchName: e.target.value })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      onClick={loadData}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-semibold"
                    >
                      {loading ? <Loader className="animate-spin" size={16} /> : <Search size={16} />} {t.search}
                    </button>
                  </div>
                  <div className="md:col-span-1">
                    <button
                      onClick={resetFilters}
                      className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm font-semibold flex items-center justify-center gap-1"
                      title={t.reset}
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>
                {error && <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
              </div>

              {/* 데이터 테이블 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
                      <tr>
                        <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none" onClick={() => handleSort('date')}>
                          <div className="flex items-center gap-2">
                            {t.date}
                            {sortConfig.key === 'date' && sortConfig.direction !== null ? (
                              sortConfig.direction === 'desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />
                            ) : (
                              <ArrowUpDown size={16} className="opacity-30" />
                            )}
                          </div>
                        </th>
                        <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none" onClick={() => handleSort('category')}>
                          <div className="flex items-center gap-2">
                            {t.category}
                            {sortConfig.key === 'category' && sortConfig.direction !== null ? (
                              sortConfig.direction === 'desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />
                            ) : (
                              <ArrowUpDown size={16} className="opacity-30" />
                            )}
                          </div>
                        </th>
                        <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none" onClick={() => handleSort('name')}>
                          <div className="flex items-center gap-2">
                            {t.name}
                            {sortConfig.key === 'name' && sortConfig.direction !== null ? (
                              sortConfig.direction === 'desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />
                            ) : (
                              <ArrowUpDown size={16} className="opacity-30" />
                            )}
                          </div>
                        </th>
                        <th className="p-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none" onClick={() => handleSort('quantity')}>
                          <div className="flex items-center justify-end gap-2">
                            {t.quantity}
                            {sortConfig.key === 'quantity' && sortConfig.direction !== null ? (
                              sortConfig.direction === 'desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />
                            ) : (
                              <ArrowUpDown size={16} className="opacity-30" />
                            )}
                          </div>
                        </th>
                        <th className="p-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none" onClick={() => handleSort('price')}>
                          <div className="flex items-center justify-end gap-2">
                            {t.price}
                            {sortConfig.key === 'price' && sortConfig.direction !== null ? (
                              sortConfig.direction === 'desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />
                            ) : (
                              <ArrowUpDown size={16} className="opacity-30" />
                            )}
                          </div>
                        </th>
                        <th className="p-4 text-right">{t.totalAmount}</th>
                        <th className="p-4">{t.note}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {(() => {
                        const indexOfLastItem = currentPage * itemsPerPage;
                        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                        const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
                        
                        return currentItems.length > 0 ? (
                          currentItems.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                              <td className="p-4">{row.date}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                  row.category === '주식' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                  row.category === '코인' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {row.category}
                                </span>
                              </td>
                              <td className="p-4 font-semibold">{row.name}</td>
                              <td className="p-4 text-right">{Number(row.quantity).toLocaleString()}</td>
                              <td className="p-4 text-right">{Number(row.price).toLocaleString()}원</td>
                              <td className="p-4 text-right font-bold text-indigo-600">
                                {(Number(row.quantity) * Number(row.price)).toLocaleString()}원
                              </td>
                              <td className="p-4 text-gray-400 text-sm">{row.note}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="p-12 text-center text-gray-400">
                              {t.noData}<br/>
                              <span className="text-xs">{t.sheetHeaderNote}</span>
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
                
                {/* 페이지네이션 */}
                {data.length > 0 && (
                  <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t.totalItems} {data.length}{t.itemsOf} {Math.min((currentPage - 1) * itemsPerPage + 1, data.length)}-{Math.min(currentPage * itemsPerPage, data.length)} {t.showing}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="text-sm font-semibold">{currentPage} / {Math.ceil(data.length / itemsPerPage)}</span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(data.length / itemsPerPage)))}
                        disabled={currentPage === Math.ceil(data.length / itemsPerPage)}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 투자항목 추가 탭 */}
          {activeTab === 'add' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" /> {t.addNewItem}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                <input type="date" value={newItem.date} onChange={e => setNewItem({...newItem, date: e.target.value})} className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                  <option>주식</option>
                  <option>코인</option>
                  <option>부동산</option>
                  <option>현금</option>
                </select>
                <input type="text" placeholder={t.name} value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 md:col-span-2" />
                <input type="number" placeholder={t.quantity} value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})} className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                <input type="number" placeholder={t.price} value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <input type="text" placeholder={t.note} value={newItem.note} onChange={e => setNewItem({...newItem, note: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 mb-4" />
              <button 
                onClick={addData}
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-bold flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin" /> : <Plus size={20} />} {t.addButton}
              </button>
              {error && <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
            </div>
          )}

          {/* 연동설정 탭 */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-green-500" />
                {t.autoConfigured}
              </h2>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <input 
                  type="text" 
                  placeholder={t.spreadsheetId} 
                  value={sheetId}
                  onChange={(e) => setSheetId(e.target.value)}
                  className="p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 w-full"
                />
                <input 
                  type="text" 
                  value={clientEmail}
                  readOnly
                  className="p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 w-full bg-gray-50 dark:bg-gray-900 text-gray-500"
                  title="Service Account Email (자동 설정)"
                />
              </div>
              <textarea 
                value={privateKey}
                readOnly
                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 font-mono text-xs h-20 mb-4 bg-gray-50 dark:bg-gray-900 text-gray-500"
                title="Private Key (자동 설정)"
              />
              <button 
                onClick={saveConfig}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} /> {t.saveSettings}
              </button>
              {error && <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Investment;
