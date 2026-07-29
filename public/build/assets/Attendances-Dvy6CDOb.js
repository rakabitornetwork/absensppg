import{a as e,i as t,l as n,n as r,o as i,s as a,t as o}from"./app-B7efW3KP.js";import{t as s}from"./createLucideIcon-BCA7nT0f.js";import{f as c,n as l,t as u}from"./MainLayout-D2RtAaPn.js";import{t as d}from"./chevron-right-pcW_luKd.js";import{t as f}from"./plus-r2VKw5rf.js";import{t as p}from"./printer-CoXlDxN2.js";var m=s(`chevron-left`,[[`path`,{d:`m15 18-6-6 6-6`,key:`1wnfg3`}]]),h=n(a(),1),g=o();function _({records:n=[],selectedMonth:a,selectedYear:o,systemSettings:s={}}){let{props:_}=e(),v=_.auth?.user?.role||`admin`,y=v===`superadmin`||v===`admin`,[b,x]=(0,h.useState)(a),[S,C]=(0,h.useState)(o),[w,T]=(0,h.useState)(!1),[E,D]=(0,h.useState)(null),[O,k]=(0,h.useState)(null),{data:A,setData:j,post:M,reset:N,errors:P}=t({employee_id:``,date:``,clock_in:``,clock_out:``,status:`Present`,notes:``}),F=[`Januari`,`Februari`,`Maret`,`April`,`Mei`,`Juni`,`Juli`,`Agustus`,`September`,`Oktober`,`November`,`Desember`],I=((e,t)=>new Date(t,e,0).getDate())(b,S),L=Array.from({length:I},(e,t)=>t+1),R=e=>{x(e),i.get(`/attendances`,{month:e,year:S},{preserveState:!0})},z=e=>{C(e),i.get(`/attendances`,{month:b,year:e},{preserveState:!0})},B=e=>{let t=Number(e)||0;if(t<60)return`${t} menit`;let n=Math.floor(t/60),r=t%60;return r>0?`${n} jam ${r} menit`:`${n} jam`},V=(e,t)=>{let r=n.find(t=>t.employee_id===e),i=r?.days[t],a=e=>e.toString().padStart(2,`0`);j({employee_id:e,date:`${S}-${a(b)}-${a(t)}`,clock_in:i?.clock_in||``,clock_out:i?.clock_out||``,status:i?.status||`Present`,notes:i?.notes||``}),D({name:r.name,nip:r.nip,day:t}),k(i?.id||null),T(!0)};return(0,g.jsxs)(u,{title:`Rekap Presensi`,children:[(0,g.jsx)(r,{title:`Rekap Presensi Bulanan`}),(0,g.jsxs)(`div`,{className:`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4`,children:[(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`h2`,{className:`text-sm font-extrabold text-slate-900 leading-none mb-1`,children:`Presensi Bulanan`}),(0,g.jsx)(`p`,{className:`text-[10px] text-slate-500 font-medium`,children:`Rekapitulasi scan kehadiran staff SPPG Sukajadi`})]}),(0,g.jsxs)(`div`,{className:`flex gap-2`,children:[(0,g.jsxs)(`button`,{onClick:()=>{let e=s.office_name||`SPPG SUKAJADI`,t=s.app_logo?window.location.origin+s.app_logo:``,r=s.office_address||``,i=s.office_email||``,a=s.office_whatsapp||``,o=F[b-1],c=`
                                <html>
                                    <head>
                                        <title>Rekap Presensi Karyawan - ${o} ${S}</title>
                                        <link rel="preconnect" href="https://fonts.googleapis.com">
                                        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                                        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
                                        <style>
                                            @media print {
                                                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                                @page { 
                                                    size: A4 landscape; 
                                                    margin: 15mm 15mm 15mm 15mm; 
                                                }
                                            }
                                            body { 
                                                font-family: 'Plus Jakarta Sans', sans-serif; 
                                                padding: 20px; 
                                                margin: 0; 
                                                color: #1e293b; 
                                                background-color: #ffffff;
                                                line-height: 1.4;
                                            }
                                            .header-container {
                                                border-bottom: 3px double #0f766e;
                                                padding-bottom: 15px;
                                                margin-bottom: 25px;
                                                display: flex;
                                                align-items: center;
                                                gap: 20px;
                                            }
                                            .logo-img {
                                                width: 60px;
                                                height: 60px;
                                                object-fit: contain;
                                                flex-shrink: 0;
                                            }
                                            .header-details {
                                                flex-grow: 1;
                                            }
                                            .brand-title {
                                                color: #0f766e;
                                                font-size: 16px;
                                                font-weight: 800;
                                                text-transform: uppercase;
                                                letter-spacing: 0.5px;
                                                margin: 0 0 2px 0;
                                            }
                                            .brand-subtitle {
                                                color: #0d9488;
                                                font-size: 11px;
                                                font-weight: 700;
                                                margin: 0 0 4px 0;
                                                letter-spacing: 0.5px;
                                            }
                                            .office-meta {
                                                color: #64748b;
                                                font-size: 9px;
                                                font-weight: 500;
                                                line-height: 1.3;
                                            }
                                            .document-meta {
                                                text-align: right;
                                                font-size: 9px;
                                                color: #64748b;
                                                font-weight: 500;
                                                margin-left: auto;
                                                border-left: 1px solid #e2e8f0;
                                                padding-left: 15px;
                                                height: 50px;
                                                display: flex;
                                                flex-direction: column;
                                                justify-content: center;
                                            }
                                            table { 
                                                width: 100%; 
                                                border-collapse: collapse; 
                                                margin-top: 10px; 
                                            }
                                            th, td { 
                                                padding: 8px 6px; 
                                                text-align: center; 
                                                font-size: 9px; 
                                                border: 1px solid #e2e8f0;
                                            }
                                            th { 
                                                background-color: #f8fafc; 
                                                color: #475569;
                                                font-weight: 700; 
                                                text-transform: uppercase;
                                            }
                                            .text-left { text-align: left; }
                                            .font-bold { font-weight: bold; }
                                            .status-h { background-color: #22c55e !important; color: white !important; font-weight: bold; }
                                            .status-t { background-color: #f59e0b !important; color: white !important; font-weight: bold; }
                                            .status-a { background-color: #ef4444 !important; color: white !important; font-weight: bold; }
                                            .status-i { background-color: #3b82f6 !important; color: white !important; font-weight: bold; }
                                            .summary-h { color: #15803d; font-weight: bold; }
                                            .summary-t { color: #b45309; font-weight: bold; }
                                            .summary-a { color: #b91c1c; font-weight: bold; }
                                            .summary-i { color: #1d4ed8; font-weight: bold; }
                                        </style>
                                    </head>
                                    <body>
                                        <div class="header-container">
                                            ${t?`<img src="${t}" class="logo-img" alt="Logo" />`:``}
                                            <div class="header-details">
                                                <h1 class="brand-title">${e}</h1>
                                                <p class="brand-subtitle">Laporan Rekapitulasi Presensi Karyawan - Periode ${o} ${S}</p>
                                                <div class="office-meta">
                                                    ${r?`<span>📍 ${r}</span>`:``}
                                                    ${i||a?`<br/>`:``}
                                                    ${i?`<span>📧 ${i}</span>`:``}
                                                    ${i&&a?`<span> | </span>`:``}
                                                    ${a?`<span>💬 WhatsApp: ${a}</span>`:``}
                                                </div>
                                            </div>
                                            <div class="document-meta">
                                                <b>REKAP PRESENSI</b>
                                                <span>Dicetak: ${new Date().toLocaleDateString(`id-ID`,{weekday:`long`,year:`numeric`,month:`long`,day:`numeric`,hour:`2-digit`,minute:`2-digit`})}</span>
                                            </div>
                                        </div>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th class="text-left" style="width: 15%">Nama Karyawan</th>
                                                    <th class="text-left" style="width: 10%">Jabatan (Role)</th>
                                                    ${L.map(e=>`<th style="width: 2%">${e}</th>`).join(``)}
                                                    <th style="width: 2.5%; color: #15803d;">H</th>
                                                    <th style="width: 2.5%; color: #b45309;">T</th>
                                                    <th style="width: 2.5%; color: #b91c1c;">A</th>
                                                    <th style="width: 2.5%; color: #1d4ed8;">I</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${n.map(e=>`
                                                        <tr>
                                                            <td class="text-left font-bold">${e.name}</td>
                                                            <td class="text-left">${e.role}</td>
                                                            ${L.map(t=>{let n=e.days[t];return n?n.status===`Present`?`<td class="status-h">H</td>`:n.status===`Late`?`<td class="status-t">T</td>`:n.status===`Absent`?`<td class="status-a">A</td>`:n.status===`Leave`?`<td class="status-i">I</td>`:`<td>-</td>`:`<td>-</td>`}).join(``)}
                                                            <td class="summary-h">${e.summary?.present||0}</td>
                                                            <td class="summary-t">${e.summary?.late||0}</td>
                                                            <td class="summary-a">${e.summary?.absent||0}</td>
                                                            <td class="summary-i">${e.summary?.leave||0}</td>
                                                        </tr>
                                                    `).join(``)}
                                            </tbody>
                                        </table>
                                    </body>
                                </html>
                            `,l=window.open(``,`_blank`);l.document.write(c),l.document.close(),l.print()},className:`bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1 active:translate-y-[1px] cursor-pointer`,children:[(0,g.jsx)(p,{className:`w-3.5 h-3.5`}),`Cetak Rekap`]}),y&&(0,g.jsxs)(`button`,{onClick:()=>{N();let e=new Date().toISOString().split(`T`)[0];j({employee_id:n[0]?.employee_id||``,date:e,clock_in:``,clock_out:``,status:`Present`,notes:``}),D(null),k(null),T(!0)},className:`bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1 active:translate-y-[1px]`,children:[(0,g.jsx)(f,{className:`w-3.5 h-3.5`}),`Input Manual`]})]})]}),(0,g.jsxs)(`div`,{className:`bg-white border border-slate-100 rounded-xl p-3 shadow-sm mb-4 flex flex-wrap items-center justify-between gap-3`,children:[(0,g.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,g.jsx)(c,{className:`w-4 h-4 text-teal-600`}),(0,g.jsx)(`span`,{className:`text-xs font-extrabold text-slate-900 uppercase`,children:`Periode Presensi:`})]}),(0,g.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,g.jsx)(`button`,{onClick:()=>R(b===1?12:b-1),className:`p-1 rounded hover:bg-slate-50 border border-slate-200`,children:(0,g.jsx)(m,{className:`w-3.5 h-3.5 text-slate-600`})}),(0,g.jsx)(`select`,{value:b,onChange:e=>R(parseInt(e.target.value)),className:`text-xs font-bold border border-slate-200 rounded-lg p-1 px-2 focus:outline-none focus:ring-1 focus:ring-teal-500/20 bg-white text-slate-800`,children:F.map((e,t)=>(0,g.jsx)(`option`,{value:t+1,children:e},t+1))}),(0,g.jsx)(`select`,{value:S,onChange:e=>z(parseInt(e.target.value)),className:`text-xs font-bold border border-slate-200 rounded-lg p-1 px-2 focus:outline-none focus:ring-1 focus:ring-teal-500/20 bg-white text-slate-800`,children:Array.from({length:5},(e,t)=>S-2+t).map(e=>(0,g.jsx)(`option`,{value:e,children:e},e))}),(0,g.jsx)(`button`,{onClick:()=>R(b===12?1:b+1),className:`p-1 rounded hover:bg-slate-50 border border-slate-200`,children:(0,g.jsx)(d,{className:`w-3.5 h-3.5 text-slate-600`})})]})]}),(0,g.jsxs)(`div`,{className:`grid grid-cols-1 lg:grid-cols-12 gap-5 items-start`,children:[(0,g.jsxs)(`div`,{className:`bg-white border border-slate-100 rounded-xl p-4 shadow-sm overflow-hidden ${w?`lg:col-span-8`:`lg:col-span-12`}`,children:[(0,g.jsxs)(`div`,{className:`flex flex-wrap items-center gap-3.5 mb-3 border-b border-slate-50 pb-2 text-[10px] font-bold text-slate-500`,children:[(0,g.jsx)(`span`,{className:`text-slate-700`,children:`Keterangan:`}),(0,g.jsxs)(`span`,{className:`flex items-center gap-1`,children:[(0,g.jsx)(`span`,{className:`w-2.5 h-2.5 rounded bg-green-500 inline-block`}),` H = Masuk Tepat Waktu`]}),(0,g.jsxs)(`span`,{className:`flex items-center gap-1`,children:[(0,g.jsx)(`span`,{className:`w-2.5 h-2.5 rounded bg-amber-500 inline-block`}),` T = Terlambat Scan`]}),(0,g.jsxs)(`span`,{className:`flex items-center gap-1`,children:[(0,g.jsx)(`span`,{className:`w-2.5 h-2.5 rounded bg-rose-500 inline-block`}),` A = Mangkir / Alpa`]}),(0,g.jsxs)(`span`,{className:`flex items-center gap-1`,children:[(0,g.jsx)(`span`,{className:`w-2.5 h-2.5 rounded bg-blue-500 inline-block`}),` I = Izin / Sakit`]}),(0,g.jsx)(`span`,{className:`text-slate-300`,children:`|`}),(0,g.jsx)(`span`,{className:`text-teal-700 underline`,children:`Klik sel tanggal untuk koreksi data`})]}),(0,g.jsx)(`div`,{className:`overflow-x-auto`,children:(0,g.jsxs)(`table`,{className:`w-full text-center border-collapse text-[10px]`,children:[(0,g.jsx)(`thead`,{children:(0,g.jsxs)(`tr`,{className:`border-b border-slate-200 text-slate-500 font-extrabold uppercase`,children:[(0,g.jsx)(`th`,{className:`py-2 pr-4 text-left min-w-[150px] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]`,children:`Nama Karyawan`}),L.map(e=>(0,g.jsx)(`th`,{className:`py-2 px-1 min-w-[20px] font-bold select-none`,children:e},e)),(0,g.jsx)(`th`,{className:`py-2 px-2 font-bold text-green-700 min-w-[24px]`,children:`H`}),(0,g.jsx)(`th`,{className:`py-2 px-2 font-bold text-amber-700 min-w-[24px]`,children:`T`}),(0,g.jsx)(`th`,{className:`py-2 px-2 font-bold text-rose-700 min-w-[24px]`,children:`A`}),(0,g.jsx)(`th`,{className:`py-2 px-2 font-bold text-blue-700 min-w-[24px]`,children:`I`})]})}),(0,g.jsx)(`tbody`,{className:`divide-y divide-slate-100 font-semibold text-slate-700`,children:n.length===0?(0,g.jsx)(`tr`,{children:(0,g.jsx)(`td`,{colSpan:I+5,className:`text-center py-6 text-slate-400 font-bold`,children:`Tidak ada data karyawan aktif.`})}):n.map(e=>(0,g.jsxs)(`tr`,{className:`hover:bg-slate-50/50 transition-colors`,children:[(0,g.jsxs)(`td`,{className:`py-2.5 pr-4 text-left font-bold text-slate-900 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] flex flex-col`,children:[(0,g.jsx)(`span`,{className:`truncate max-w-[140px]`,children:e.name}),(0,g.jsx)(`span`,{className:`text-[8px] text-slate-400 font-medium tracking-wide leading-none mt-0.5`,children:e.role})]}),L.map(t=>{let n=e.days[t],r=y?`cursor-pointer`:`cursor-default`,i=`text-slate-300 bg-slate-50/30 ${y?`hover:bg-slate-100 cursor-pointer`:`cursor-default`}`,a=`-`;return n&&(n.status===`Present`?(i=`bg-green-500 text-white font-bold ${r} rounded ${y?`hover:scale-110 transition-transform`:``}`,a=`H`):n.status===`Late`?(i=`bg-amber-500 text-white font-bold ${r} rounded ${y?`hover:scale-110 transition-transform`:``}`,a=`T`):n.status===`Absent`?(i=`bg-rose-500 text-white font-bold ${r} rounded ${y?`hover:scale-110 transition-transform`:``}`,a=`A`):n.status===`Leave`&&(i=`bg-blue-500 text-white font-bold ${r} rounded ${y?`hover:scale-110 transition-transform`:``}`,a=`I`)),(0,g.jsx)(`td`,{onClick:()=>y&&V(e.employee_id,t),className:`p-1 border border-slate-100 ${i}`,title:n?`${e.name} (${t}/${b}): ${n.status}${n.status===`Late`?` (${B(n.late_minutes)})`:``} ${n.clock_in?`[${n.clock_in} - ${n.clock_out||`?`}]`:``}`:y?`Klik untuk input presensi tgl ${t}`:`Tidak ada data tgl ${t}`,children:a},t)}),(0,g.jsx)(`td`,{className:`py-2.5 px-2 text-green-600 font-bold bg-green-50/20`,children:e.summary.present}),(0,g.jsx)(`td`,{className:`py-2.5 px-2 text-amber-600 font-bold bg-amber-50/20`,children:e.summary.late}),(0,g.jsx)(`td`,{className:`py-2.5 px-2 text-rose-600 font-bold bg-rose-50/20`,children:e.summary.absent}),(0,g.jsx)(`td`,{className:`py-2.5 px-2 text-blue-600 font-bold bg-blue-50/20`,children:e.summary.leave})]},e.employee_id))})]})})]}),w&&(0,g.jsxs)(`div`,{className:`lg:col-span-4 bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-4 animate-in slide-in-from-right-4 duration-200`,children:[(0,g.jsxs)(`div`,{className:`flex items-center justify-between border-b border-slate-50 pb-2`,children:[(0,g.jsx)(`h3`,{className:`text-xs font-extrabold text-slate-900 uppercase tracking-wider`,children:E?`Koreksi Presensi`:`Input Presensi Baru`}),(0,g.jsx)(`button`,{onClick:()=>T(!1),className:`text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-50`,children:(0,g.jsx)(l,{className:`w-4 h-4`})})]}),E&&(0,g.jsxs)(`div`,{className:`p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs leading-normal`,children:[(0,g.jsx)(`p`,{className:`font-bold text-slate-800`,children:E.name}),(0,g.jsxs)(`p`,{className:`text-[10px] text-slate-500 font-bold`,children:[`NIP: `,E.nip,` • Tanggal `,E.day,` `,F[b-1],` `,S]})]}),(0,g.jsxs)(`form`,{onSubmit:e=>{e.preventDefault(),M(`/attendances/manual`,{onSuccess:()=>{T(!1),k(null),N()}})},className:`space-y-3`,children:[!E&&(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`label`,{className:`block text-[10px] font-bold text-slate-600 mb-1`,children:`Pilih Karyawan`}),(0,g.jsx)(`select`,{value:A.employee_id,onChange:e=>j(`employee_id`,e.target.value),className:`w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none`,required:!0,children:n.map(e=>(0,g.jsxs)(`option`,{value:e.employee_id,children:[e.name,` (`,e.role,`)`]},e.employee_id))})]}),!E&&(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`label`,{className:`block text-[10px] font-bold text-slate-600 mb-1`,children:`Tanggal`}),(0,g.jsx)(`input`,{type:`date`,value:A.date,onChange:e=>j(`date`,e.target.value),className:`w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none`,required:!0})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`label`,{className:`block text-[10px] font-bold text-slate-600 mb-1`,children:`Status Kehadiran`}),(0,g.jsxs)(`select`,{value:A.status,onChange:e=>j(`status`,e.target.value),className:`w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none`,children:[(0,g.jsx)(`option`,{value:`Present`,children:`Present (Hadir Tepat Waktu)`}),(0,g.jsx)(`option`,{value:`Late`,children:`Late (Terlambat Scan)`}),(0,g.jsx)(`option`,{value:`Absent`,children:`Absent (Alpa/Mangkir)`}),(0,g.jsx)(`option`,{value:`Leave`,children:`Leave (Izin Resmi / Sakit)`})]})]}),(A.status===`Present`||A.status===`Late`)&&(0,g.jsxs)(`div`,{className:`grid grid-cols-2 gap-2`,children:[(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`label`,{className:`block text-[10px] font-bold text-slate-600 mb-1`,children:`Jam Masuk`}),(0,g.jsx)(`input`,{type:`time`,value:A.clock_in,onChange:e=>j(`clock_in`,e.target.value),className:`w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none`,placeholder:`06:00`,required:A.status===`Late`})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`label`,{className:`block text-[10px] font-bold text-slate-600 mb-1`,children:`Jam Pulang`}),(0,g.jsx)(`input`,{type:`time`,value:A.clock_out,onChange:e=>j(`clock_out`,e.target.value),className:`w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none`,placeholder:`15:00`})]})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`label`,{className:`block text-[10px] font-bold text-slate-600 mb-1`,children:`Catatan Koreksi (Opsional)`}),(0,g.jsx)(`textarea`,{value:A.notes,onChange:e=>j(`notes`,e.target.value),rows:`2`,className:`w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none`,placeholder:`Contoh: Lupa bawa kartu, Izin sakit dengan surat, dll.`})]}),(0,g.jsxs)(`div`,{className:`flex gap-2`,children:[(0,g.jsx)(`button`,{type:`submit`,className:`flex-grow bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow transition-all flex items-center justify-center gap-1 active:translate-y-[1px]`,children:`Simpan Rekor`}),O&&v===`superadmin`&&(0,g.jsx)(`button`,{type:`button`,onClick:()=>{confirm(`Apakah Anda yakin ingin menghapus data presensi ini?`)&&i.post(`/attendances/${O}/delete`,{},{onSuccess:()=>{T(!1),k(null),N()}})},className:`bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold py-2 px-3 rounded-lg border border-rose-200 transition-colors flex items-center justify-center gap-1 cursor-pointer`,children:`Hapus`})]})]})]})]})]})}export{_ as default};