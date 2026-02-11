import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from './LanguageContext';
import { Plus, Trash2, Save, Edit, RefreshCw, X, Search, Filter, User, Users, Lock } from 'lucide-react';

const PermissionManagementTab = () => {
    const { t } = useLanguage();

    // 상태 관리
    const [permissions, setPermissions] = useState([]);
    const [menuList, setMenuList] = useState([]); // 메뉴 목록 (Dropdown용)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 검색 및 필터 상태
    const [userKeyword, setUserKeyword] = useState(''); // 사용자 ID 검색
    const [activeUserKeyword, setActiveUserKeyword] = useState('');
    const [menuKeyword, setMenuKeyword] = useState(''); // 메뉴 코드 검색
    const [activeMenuKeyword, setActiveMenuKeyword] = useState('');
    const [menuFilter, setMenuFilter] = useState('ALL');
    const [activeMenuFilter, setActiveMenuFilter] = useState('ALL'); // 실제 적용된 메뉴 필터

    // 추가 조회 조건
    const [useYnFilter, setUseYnFilter] = useState('ALL');
    const [activeUseYnFilter, setActiveUseYnFilter] = useState('ALL');
    const [descFilter, setDescFilter] = useState('');
    const [activeDescFilter, setActiveDescFilter] = useState('');

    // 편집 상태
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // 신규 추가 폼
    const initialFormState = {
        user_email: '',
        menu_code: '',
        menu_uuid: '',
        access_yn: 'Y',
        description: ''
    };
    const [newPermForm, setNewPermForm] = useState(initialFormState);

    // 환경 변수 설정
    const sheetId = localStorage.getItem('sheet_id') || '';
    const clientEmail = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
    const privateKey = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '';

    // API 호출 공통 함수
    const fetchSheetData = async (sheetName) => {
        const apiUrl = import.meta.env.DEV
            ? 'http://localhost:3001/api/sheets/data'
            : '/.netlify/functions/sheets-data';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sheetId, clientEmail, privateKey, sheetName }),
        });

        if (!response.ok) {
            if (response.status === 404) return [];
            const text = await response.text();
            throw new Error(`Failed to fetch ${sheetName}: ${text}`);
        }

        const json = await response.json();
        return json.data || [];
    };

    // ID Helper
    const getRowId = (item) => {
        if (!item) return null;
        const val = item.uuid || item.id || item.ID || item.UUID || item.Id || item._id;
        return val ? String(val) : null;
    };

    // 데이터 로드 (권한 목록 + 메뉴 목록)
    const loadData = async () => {
        if (!sheetId || !clientEmail || !privateKey) {
            setError('구글 시트 연동 설정이 필요합니다.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 병렬 호출
            const [permData, menuData] = await Promise.all([
                fetchSheetData('auth_menu_mgt'),
                fetchSheetData('menu_def_mgt')
            ]);

            setPermissions(permData);

            const sortedMenus = (menuData || []).sort((a, b) => Number(a.sort_order || 999) - Number(b.sort_order || 999));
            setMenuList(sortedMenus);

            // 메뉴 목록 로드 후 기본 메뉴 코드 설정 (첫번째 메뉴)
            if (sortedMenus.length > 0 && !newPermForm.menu_code) {
                const firstMenu = sortedMenus[0];
                const firstId = getRowId(firstMenu);
                setNewPermForm(prev => ({
                    ...prev,
                    menu_code: firstMenu.menu_code,
                    menu_uuid: firstId || firstMenu.uuid
                }));
            }

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

    // 검색 핸들러 (조회하기 버튼 클릭)
    const handleSearch = async () => {
        setActiveUserKeyword(userKeyword);
        setActiveMenuKeyword(menuKeyword);
        setActiveMenuFilter(menuFilter);
        setActiveUseYnFilter(useYnFilter);
        setActiveDescFilter(descFilter);
        await loadData();
    };

    const handleMenuChange = (menuUuid, isNew) => {
        // String comparison intended
        const menu = menuList.find(m => getRowId(m) === String(menuUuid));
        if (isNew) {
            setNewPermForm(prev => ({
                ...prev,
                menu_uuid: menuUuid,
                menu_code: menu ? menu.menu_code : ''
            }));
        } else {
            setEditForm(prev => ({
                ...prev,
                menu_uuid: menuUuid,
                menu_code: menu ? menu.menu_code : ''
            }));
        }
    };

    // 필터링된 목록 (메뉴 정보 Join)
    const filteredList = useMemo(() => {
        let result = permissions.map(p => {
            // p.menu_uuid might be number or string. getRowId returns string.
            const pMenuUuid = p.menu_uuid ? String(p.menu_uuid) : '';
            const menu = menuList.find(m => getRowId(m) === pMenuUuid);
            return {
                ...p,
                menu_label: menu ? menu.label_key : p.menu_code, // fallback to code if label not found
                menu_code: menu ? menu.menu_code : p.menu_code // ensure code is available
            };
        });

        // 1. Menu Filter (Active Filter 사용)
        if (activeMenuFilter !== 'ALL') {
            result = result.filter(item => item.menu_code === activeMenuFilter);
        }

        // 2. Use YN Filter
        if (activeUseYnFilter !== 'ALL') {
            result = result.filter(item => (item.access_yn || 'Y') === activeUseYnFilter);
        }

        // 3. Description Filter
        if (activeDescFilter.trim()) {
            const lowerDesc = activeDescFilter.toLowerCase();
            result = result.filter(item => item.description && item.description.toLowerCase().includes(lowerDesc));
        }

        // 4. User Email Search
        if (activeUserKeyword.trim()) {
            const lowerKey = activeUserKeyword.toLowerCase();
            result = result.filter(item => item.user_email && item.user_email.toLowerCase().includes(lowerKey));
        }

        // 5. Menu Code Search
        if (activeMenuKeyword.trim()) {
            const lowerKey = activeMenuKeyword.toLowerCase();
            result = result.filter(item =>
                (item.menu_code && item.menu_code.toLowerCase().includes(lowerKey)) ||
                (item.menu_label && item.menu_label.toLowerCase().includes(lowerKey))
            );
        }

        return result;
    }, [permissions, menuList, activeUserKeyword, activeMenuKeyword, activeMenuFilter, activeUseYnFilter, activeDescFilter]);


    // --- CRUD ---

    const handleAdd = async () => {
        if (!newPermForm.user_email || !newPermForm.menu_code) {
            alert('사용자 이메일과 메뉴 코드는 필수입니다.');
            return;
        }

        // 중복 체크 (User + Menu 조합)
        if (permissions.some(p => p.user_email === newPermForm.user_email && p.menu_code === newPermForm.menu_code)) {
            alert('해당 사용자에 대한 해당 메뉴 권한이 이미 존재합니다.');
            return;
        }

        const newItem = {
            ...newPermForm,
            access_yn: newPermForm.access_yn || 'Y'
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
                    sheetName: 'auth_menu_mgt',
                    item: newItem
                }),
            });

            if (!response.ok) throw new Error('추가 실패');
            const resData = await response.json();

            setPermissions(prev => [...prev, { ...newItem, uuid: resData.id }]);

            // 이메일은 연속 입력을 위해 유지, 메뉴만 초기화? 아니면 전체 초기화?
            // 보통 연속 입력 편의를 위해 이메일은 유지하는게 좋음.
            // 기본값 재설정
            const defaultMenu = menuList.length > 0 ? menuList[0] : null;
            setNewPermForm(prev => ({
                ...prev,
                menu_code: defaultMenu ? defaultMenu.menu_code : '',
                menu_uuid: defaultMenu ? defaultMenu.uuid : '',
                description: ''
            }));

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
                    sheetName: 'auth_menu_mgt',
                    uuid: editingId,
                    item: editForm
                }),
            });

            if (!response.ok) throw new Error('수정 실패');

            setPermissions(prev => prev.map(item => (getRowId(item) === editingId ? { ...editForm } : item)));
            setEditingId(null);
            setEditForm({});
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (item) => {
        const rowId = getRowId(item);
        if (!rowId) {
            alert('삭제할 아이디를 찾을 수 없습니다.');
            return;
        }

        if (!confirm(`정말 삭제하시겠습니까? (${item.user_email} - ${item.menu_code})`)) return;

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
                    sheetName: 'auth_menu_mgt',
                    uuid: rowId
                }),
            });

            if (!response.ok) throw new Error('삭제 실패');

            setPermissions(prev => prev.filter(p => getRowId(p) !== rowId));
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden p-6">
            {/* 상단 검색 & 필터 */}
            <div className="flex flex-wrap items-center gap-4 mb-4 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">

                {/* 사용자 ID 검색 */}
                <div className="relative flex-1 min-w-[150px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={16} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 p-2 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="User ID (Email)"
                        value={userKeyword}
                        onChange={(e) => setUserKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                    />
                </div>

                {/* 메뉴 코드 검색 */}
                <div className="relative flex-1 min-w-[150px]">
                    <input
                        type="text"
                        className="block w-full p-2 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="Menu Code"
                        value={menuKeyword}
                        onChange={(e) => setMenuKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                    />
                </div>

                {/* Description Search */}
                <div className="relative flex-1 min-w-[150px]">
                    <input
                        type="text"
                        className="block w-full p-2 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="Description"
                        value={descFilter}
                        onChange={(e) => setDescFilter(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                    />
                </div>

                {/* Use YN Filter */}
                <div className="flex items-center gap-2">
                    <select
                        value={useYnFilter}
                        onChange={(e) => setUseYnFilter(e.target.value)}
                        className="block w-24 pl-3 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    >
                        <option value="ALL">Use (All)</option>
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                    </select>
                </div>

                {/* 메뉴 필터 */}
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500" />
                    <select
                        value={menuFilter}
                        onChange={(e) => setMenuFilter(e.target.value)}
                        className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    >
                        <option value="ALL">메뉴 (전체)</option>
                        {menuList.map(menu => (
                            <option key={menu.menu_code} value={menu.menu_code}>
                                {menu.label_key} ({menu.menu_code})
                            </option>
                        ))}
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
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-64">User Email (Required)</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">Menu Code</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24 text-center">USE YN</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24 text-right">Manage</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                        {/* 1. 신규 추가 행 (Investment Style) */}
                        <tr className="bg-blue-50/50 dark:bg-blue-900/10 border-b-2 border-indigo-100 dark:border-indigo-900/30">
                            {/* User Email */}
                            <td className="px-2 py-2">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <Users size={14} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="user@example.com"
                                        className="block w-full pl-8 text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                                        value={newPermForm.user_email}
                                        onChange={e => setNewPermForm({ ...newPermForm, user_email: e.target.value })}
                                    />
                                </div>
                            </td>
                            {/* Menu Code */}
                            <td className="px-2 py-2">
                                <select
                                    className="block w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                                    value={newPermForm.menu_uuid}
                                    onChange={e => handleMenuChange(e.target.value, true)}
                                >
                                    <option value="">Select Menu</option>
                                    {menuList.map((menu, idx) => (
                                        <option key={getRowId(menu) || idx} value={getRowId(menu)}>
                                            {menu.label_key}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            {/* USE YN (Combo) */}
                            <td className="px-2 py-2 text-center">
                                <select
                                    className="block w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 text-center"
                                    value={newPermForm.access_yn || 'Y'}
                                    onChange={e => setNewPermForm({ ...newPermForm, access_yn: e.target.value })}
                                >
                                    <option value="Y">Y</option>
                                    <option value="N">N</option>
                                </select>
                            </td>
                            {/* Description */}
                            <td className="px-2 py-2">
                                <input
                                    type="text"
                                    placeholder="Optional description"
                                    className="block w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                                    value={newPermForm.description}
                                    onChange={e => setNewPermForm({ ...newPermForm, description: e.target.value })}
                                />
                            </td>
                            {/* Add Button */}
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
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm">
                                    {loading ? '데이터 로딩 중...' : '등록된 권한이 없습니다.'}
                                </td>
                            </tr>
                        ) : (
                            filteredList.map((item, idx) => {
                                const rowId = getRowId(item);
                                const isEditing = editingId !== null && rowId !== null && String(editingId) === String(rowId);
                                return (
                                    <tr key={rowId || idx} className={`border-t border-gray-100 dark:border-gray-700 transition-colors ${isEditing ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>

                                        {/* User Email */}
                                        <td className="px-4 py-4">
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    className="w-full text-sm border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                                    value={editForm.user_email}
                                                    onChange={e => setEditForm({ ...editForm, user_email: e.target.value })}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                                        {(item.user_email || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.user_email}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Menu (Label Only) */}
                                        <td className="px-4 py-4">
                                            {isEditing ? (
                                                <select
                                                    className="w-full text-sm border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                                    value={editForm.menu_uuid}
                                                    onChange={e => handleMenuChange(e.target.value, false)}
                                                >
                                                    <option value="">Select Menu</option>
                                                    {menuList.map((menu, idx) => (
                                                        <option key={getRowId(menu) || idx} value={getRowId(menu)}>
                                                            {menu.label_key}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="text-sm">
                                                    <span className="font-bold text-gray-700 dark:text-gray-200">{item.menu_label || item.menu_code}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* USE YN */}
                                        <td className="px-4 py-4 text-center">
                                            {isEditing ? (
                                                <select
                                                    className="text-sm border p-2 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                                    value={editForm.access_yn}
                                                    onChange={e => setEditForm({ ...editForm, access_yn: e.target.value })}
                                                >
                                                    <option value="Y">Y</option>
                                                    <option value="N">N</option>
                                                </select>
                                            ) : (
                                                <span className={`text-xs font-bold ${item.access_yn === 'N' ? 'text-red-500' : 'text-green-500'}`}>
                                                    {item.access_yn || 'Y'}
                                                </span>
                                            )}
                                        </td>

                                        {/* Description */}
                                        <td className="px-4 py-4">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="w-full text-sm border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                                    value={editForm.description}
                                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                />
                                            ) : (
                                                <span className="text-sm text-gray-500 truncate block max-w-xs">{item.description}</span>
                                            )}
                                        </td>

                                        {/* Action */}
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
        </div>
    );
};

export default PermissionManagementTab;
