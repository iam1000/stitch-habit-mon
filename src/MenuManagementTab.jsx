import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from './LanguageContext';
import { Plus, Trash2, Save, Edit, RefreshCw, X, Search, Filter } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { AVAILABLE_ICONS } from './constants/iconOptions';

const MenuManagementTab = () => {
    const { t } = useLanguage();

    // 상태 관리
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 검색 및 필터 상태
    const [searchParams, setSearchParams] = useState({ code: '', label: '', path: '' });
    const [activeSearchParams, setActiveSearchParams] = useState({ code: '', label: '', path: '' }); // 실제 조회에 사용되는 필터
    const [locationFilter, setLocationFilter] = useState('ALL'); // 'ALL', 'sidebar', 'bottom' (입력값)
    const [activeLocationFilter, setActiveLocationFilter] = useState('ALL'); // 실제 조회에 사용되는 필터

    // 편집 상태
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // 신규 추가 폼
    const initialFormState = {
        menu_code: '',
        label_key: '',
        path: '/',
        icon_name: 'Circle',
        sort_order: '',
        location: 'sidebar',
        use_yn: 'Y'
    };
    const [newMenuForm, setNewMenuForm] = useState(initialFormState);

    // 환경 변수 설정
    const sheetId = localStorage.getItem('sheet_id') || '';
    const clientEmail = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
    const privateKey = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '';

    // ID 추출 헬퍼 (uuid, id 대소문자 호환)
    const getRowId = (item) => {
        if (!item) return null;
        const val = item.uuid || item.id || item.ID || item.UUID || item.Id || item._id;
        return val ? String(val) : null;
    };

    // 데이터 로드
    const loadData = async () => {
        if (!sheetId || !clientEmail || !privateKey) {
            setError('구글 시트 연동 설정이 필요합니다.');
            return;
        }

        setLoading(true);
        setError(null);

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
                    sheetName: 'menu_def_mgt'
                }),
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                setMenus([]);
                return;
            }

            if (!response.ok) {
                if (response.status === 404) {
                    setMenus([]);
                    return;
                }
                throw new Error(result.error || result.message || '데이터 로드 실패');
            }

            if (!result.data || !Array.isArray(result.data)) {
                if (result.data === undefined) {
                    setMenus([]);
                    return;
                }
                throw new Error('데이터 형식이 올바르지 않습니다.');
            }

            // sort_order 정렬
            const sortedData = result.data.sort((a, b) => Number(a.sort_order || 999) - Number(b.sort_order || 999));
            setMenus(sortedData);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 최초 1회 로드
    useEffect(() => {
        loadData();
    }, []);

    // 데이터 조회 (서버 로드 + 필터 적용)
    const handleSearch = async () => {
        setActiveSearchParams(searchParams);
        setActiveLocationFilter(locationFilter);
        await loadData();
    };

    // 필터링된 목록
    const filteredList = useMemo(() => {
        let result = menus;

        // 1. Location Filter (Active Filter 사용)
        if (activeLocationFilter !== 'ALL') {
            result = result.filter(item => item.location === activeLocationFilter);
        }

        // 2. Keyword Search (Manual Trigger)
        if (activeSearchParams.code) {
            result = result.filter(item => item.menu_code && item.menu_code.toLowerCase().includes(activeSearchParams.code.toLowerCase()));
        }
        if (activeSearchParams.label) {
            result = result.filter(item => item.label_key && item.label_key.toLowerCase().includes(activeSearchParams.label.toLowerCase()));
        }
        if (activeSearchParams.path) {
            result = result.filter(item => item.path && item.path.toLowerCase().includes(activeSearchParams.path.toLowerCase()));
        }

        return result;
    }, [menus, activeSearchParams, activeLocationFilter]);


    // --- CRUD ---

    const handleAdd = async () => {
        if (!newMenuForm.menu_code || !newMenuForm.label_key || !newMenuForm.path) {
            alert('필수 입력 항목(Code, Label, Path)을 확인해주세요.');
            return;
        }

        // 중복 체크
        if (menus.some(m => m.menu_code === newMenuForm.menu_code)) {
            alert('이미 존재하는 메뉴 코드입니다.');
            return;
        }

        const newItem = {
            ...newMenuForm,
            sort_order: newMenuForm.sort_order || filteredList.length + 1
        };

        try {
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
                    sheetName: 'menu_def_mgt',
                    item: newItem
                }),
            });

            if (!response.ok) throw new Error('추가 실패');
            const resData = await response.json();

            setMenus(prev => [...prev, { ...newItem, uuid: resData.id }].sort((a, b) => Number(a.sort_order) - Number(b.sort_order)));
            setNewMenuForm({ ...initialFormState, sort_order: '' });
        } catch (err) {
            alert(err.message);
        }
    };

    const handleUpdate = async () => {
        if (!editingId) return;

        try {
            const apiUrl = import.meta.env.DEV
                ? 'http://localhost:3001/api/sheets/update'
                : '/.netlify/functions/sheets-update';

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sheetId,
                    clientEmail,
                    privateKey,
                    sheetName: 'menu_def_mgt',
                    uuid: editingId,
                    item: editForm
                }),
            });

            if (!response.ok) throw new Error('수정 실패');

            setMenus(prev => prev.map(item => (getRowId(item) === editingId ? { ...editForm } : item)));
            setEditingId(null);
            setEditForm({});
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (item) => {
        const rowId = getRowId(item);
        if (!rowId) {
            alert('삭제할 Row ID를 찾을 수 없습니다.');
            return;
        }
        if (!confirm(`정말 삭제하시겠습니까? (${item.label_key})`)) return;

        try {
            const apiUrl = import.meta.env.DEV
                ? 'http://localhost:3001/api/sheets/delete'
                : '/.netlify/functions/sheets-delete';

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sheetId,
                    clientEmail,
                    privateKey,
                    sheetName: 'menu_def_mgt',
                    uuid: rowId
                }),
            });

            if (!response.ok) throw new Error('삭제 실패');

            setMenus(prev => prev.filter(m => getRowId(m) !== rowId));
        } catch (err) {
            alert(err.message);
        }
    };

    // Helper to render icon
    const renderIcon = (iconName) => {
        const Icon = LucideIcons[iconName] || LucideIcons.HelpCircle;
        return <Icon size={16} />;
    };

    return (
        <div className="flex flex-col h-full overflow-hidden p-6">
            {/* 상단 검색 & 필터 */}
            <div className="flex flex-wrap items-center gap-4 mb-4 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">

                {/* 검색 필드 (Code, Label, Path) */}
                <div className="flex flex-1 gap-2 flex-wrap min-w-[300px]">
                    <input
                        type="text"
                        className="block w-32 p-2 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="Code"
                        value={searchParams.code}
                        onChange={(e) => setSearchParams({ ...searchParams, code: e.target.value })}
                    />
                    <input
                        type="text"
                        className="block w-40 flex-1 p-2 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="Label"
                        value={searchParams.label}
                        onChange={(e) => setSearchParams({ ...searchParams, label: e.target.value })}
                    />
                    <input
                        type="text"
                        className="block w-40 flex-1 p-2 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="Path"
                        value={searchParams.path}
                        onChange={(e) => setSearchParams({ ...searchParams, path: e.target.value })}
                    />
                </div>

                {/* 위치 필터 */}
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500" />
                    <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="block w-28 pl-3 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    >
                        <option value="ALL">Loc(All)</option>
                        <option value="sidebar">Sidebar</option>
                        <option value="bottom">Bottom</option>
                    </select>
                </div>

                {/* 조회하기 버튼 */}
                <button
                    onClick={handleSearch}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-sm transition-colors shadow-sm"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    <span>조회하기</span>
                </button>
            </div>

            {/* 테이블 */}
            <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm bg-white dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16 text-center">Sort</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">Code</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">Label</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Path</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">Icon</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24 text-center">Loc</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20 text-center">Use</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20 text-right">Manage</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">

                        {/* 1. 신규 추가 행 (Investment Style) */}
                        <tr className="bg-blue-50/50 dark:bg-blue-900/10 border-b-2 border-indigo-100 dark:border-indigo-900/30">
                            {/* Sort */}
                            <td className="px-2 py-2">
                                <input
                                    type="number"
                                    placeholder="No"
                                    className="block w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center focus:ring-2 focus:ring-indigo-500"
                                    value={newMenuForm.sort_order}
                                    onChange={e => setNewMenuForm({ ...newMenuForm, sort_order: e.target.value })}
                                />
                            </td>
                            {/* Code */}
                            <td className="px-2 py-2">
                                <input
                                    type="text"
                                    placeholder="Code"
                                    className="block w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono focus:ring-2 focus:ring-indigo-500"
                                    value={newMenuForm.menu_code}
                                    onChange={e => setNewMenuForm({ ...newMenuForm, menu_code: e.target.value })}
                                />
                            </td>
                            {/* Label */}
                            <td className="px-2 py-2">
                                <input
                                    type="text"
                                    placeholder="Label Key"
                                    className="block w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                                    value={newMenuForm.label_key}
                                    onChange={e => setNewMenuForm({ ...newMenuForm, label_key: e.target.value })}
                                />
                            </td>
                            {/* Path */}
                            <td className="px-2 py-2">
                                <input
                                    type="text"
                                    placeholder="/path"
                                    className="block w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                                    value={newMenuForm.path}
                                    onChange={e => setNewMenuForm({ ...newMenuForm, path: e.target.value })}
                                />
                            </td>
                            {/* Icon */}
                            <td className="px-2 py-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500 flex-none">
                                        {renderIcon(newMenuForm.icon_name)}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Icon"
                                        className="block w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                                        value={newMenuForm.icon_name}
                                        list="icon-options"
                                        onChange={e => setNewMenuForm({ ...newMenuForm, icon_name: e.target.value })}
                                    />
                                </div>
                            </td>
                            {/* Loc */}
                            <td className="px-2 py-2">
                                <select
                                    className="block w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 map-select"
                                    value={newMenuForm.location}
                                    onChange={e => setNewMenuForm({ ...newMenuForm, location: e.target.value })}
                                >
                                    <option value="sidebar">Side</option>
                                    <option value="bottom">Bot</option>
                                </select>
                            </td>
                            {/* Use */}
                            <td className="px-2 py-2 text-center">
                                <select
                                    className="block w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 text-center"
                                    value={newMenuForm.use_yn}
                                    onChange={e => setNewMenuForm({ ...newMenuForm, use_yn: e.target.value })}
                                >
                                    <option value="Y">Y</option>
                                    <option value="N">N</option>
                                </select>
                            </td>
                            {/* Action */}
                            <td className="px-2 py-2 text-right">
                                <button
                                    onClick={handleAdd}
                                    className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors shadow-sm inline-flex items-center justify-center"
                                    title="추가"
                                >
                                    <Plus size={18} />
                                </button>
                            </td>
                        </tr>

                        {/* 2. 데이터 목록 */}
                        {filteredList.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-6 py-12 text-center text-gray-400 text-sm">
                                    {loading ? '데이터 로딩 중...' : '등록된 메뉴가 없습니다.'}
                                </td>
                            </tr>
                        ) : (
                            filteredList.map((item, idx) => {
                                const rowId = getRowId(item);
                                const isEditing = editingId !== null && rowId !== null && String(editingId) === String(rowId);
                                return (
                                    <tr key={rowId || idx} className={`border-t border-gray-100 dark:border-gray-700 transition-colors ${isEditing ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>

                                        {/* Sort */}
                                        <td className="px-4 py-4 text-center">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="w-full text-sm border p-2 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                                    value={editForm.sort_order}
                                                    onChange={e => setEditForm({ ...editForm, sort_order: e.target.value })}
                                                />
                                            ) : (
                                                <span className="text-sm text-gray-500">{item.sort_order}</span>
                                            )}
                                        </td>

                                        {/* Code */}
                                        <td className="px-4 py-4">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="w-full text-sm border p-2 rounded font-mono bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-500 cursor-not-allowed"
                                                    value={editForm.menu_code}
                                                    disabled
                                                    readOnly
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-900 dark:text-white font-mono">{item.menu_code}</div>
                                            )}
                                        </td>

                                        {/* Label */}
                                        <td className="px-4 py-4">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="w-full text-sm border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                                    value={editForm.label_key}
                                                    onChange={e => setEditForm({ ...editForm, label_key: e.target.value })}
                                                />
                                            ) : (
                                                <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{item.label_key}</div>
                                            )}
                                        </td>

                                        {/* Path */}
                                        <td className="px-4 py-4 text-sm text-gray-500 font-mono">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="w-full text-sm border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                                    value={editForm.path}
                                                    onChange={e => setEditForm({ ...editForm, path: e.target.value })}
                                                />
                                            ) : item.path}
                                        </td>

                                        {/* Icon */}
                                        <td className="px-4 py-4">
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 bg-white dark:bg-gray-600 border rounded flex-none">{renderIcon(editForm.icon_name)}</div>
                                                    <input
                                                        type="text"
                                                        className="w-full text-sm border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                                        value={editForm.icon_name}
                                                        list="icon-options"
                                                        onChange={e => setEditForm({ ...editForm, icon_name: e.target.value })}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    {renderIcon(item.icon_name)}
                                                    <span className="text-xs">{item.icon_name}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Location */}
                                        <td className="px-4 py-4 text-center">
                                            {isEditing ? (
                                                <select
                                                    className="text-sm border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                                    value={editForm.location}
                                                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                                >
                                                    <option value="sidebar">Side</option>
                                                    <option value="bottom">Bot</option>
                                                </select>
                                            ) : (
                                                <span className={`text-xs px-2 py-1 rounded ${item.location === 'bottom' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {item.location === 'bottom' ? 'Bot' : 'Side'}
                                                </span>
                                            )}
                                        </td>

                                        {/* Use Y/N */}
                                        <td className="px-4 py-4 text-center">
                                            {isEditing ? (
                                                <select
                                                    className="text-sm border p-2 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                                    value={editForm.use_yn}
                                                    onChange={e => setEditForm({ ...editForm, use_yn: e.target.value })}
                                                >
                                                    <option value="Y">Y</option>
                                                    <option value="N">N</option>
                                                </select>
                                            ) : (
                                                <span className={`text-xs font-bold ${item.use_yn === 'N' ? 'text-red-500' : 'text-green-500'}`}>
                                                    {item.use_yn}
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-4 text-right whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <button onClick={handleUpdate} className="text-green-600 hover:text-green-900 border border-green-200 p-1 rounded bg-green-50"><Save size={16} /></button>
                                                        <button onClick={() => { setEditingId(null); setEditForm({}); }} className="text-gray-400 hover:text-gray-600 border border-gray-200 p-1 rounded"><X size={16} /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => { setEditingId(rowId); setEditForm(item); }} className="text-indigo-600 hover:text-indigo-900"><Edit size={16} /></button>
                                                        <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <datalist id="icon-options">
                {AVAILABLE_ICONS.map(icon => (
                    <option key={icon} value={icon} />
                ))}
            </datalist>
        </div>
    );
};

export default MenuManagementTab;
