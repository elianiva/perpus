let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/Dev/perpus-inertia
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
set shortmess=aoO
argglobal
%argdel
edit app/Controllers/Http/UsersController.ts
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
wincmd _ | wincmd |
vsplit
1wincmd h
wincmd _ | wincmd |
split
1wincmd k
wincmd w
wincmd w
let &splitbelow = s:save_splitbelow
let &splitright = s:save_splitright
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
exe '1resize ' . ((&lines * 17 + 18) / 37)
exe 'vert 1resize ' . ((&columns * 83 + 83) / 167)
exe '2resize ' . ((&lines * 16 + 18) / 37)
exe 'vert 2resize ' . ((&columns * 83 + 83) / 167)
exe 'vert 3resize ' . ((&columns * 83 + 83) / 167)
argglobal
balt start/routes.ts
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 3 - ((2 * winheight(0) + 8) / 17)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 3
normal! 0
wincmd w
argglobal
if bufexists("start/routes.ts") | buffer start/routes.ts | else | edit start/routes.ts | endif
if &buftype ==# 'terminal'
  silent file start/routes.ts
endif
balt app/Controllers/Http/UsersController.ts
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 36 - ((12 * winheight(0) + 8) / 16)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 36
normal! 05|
wincmd w
argglobal
if bufexists("resources/views/admin/dashboard/anggota.edge") | buffer resources/views/admin/dashboard/anggota.edge | else | edit resources/views/admin/dashboard/anggota.edge | endif
if &buftype ==# 'terminal'
  silent file resources/views/admin/dashboard/anggota.edge
endif
balt resources/views/admin/dashboard/index.edge
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 33 - ((6 * winheight(0) + 17) / 34)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 33
normal! 0
wincmd w
3wincmd w
exe '1resize ' . ((&lines * 17 + 18) / 37)
exe 'vert 1resize ' . ((&columns * 83 + 83) / 167)
exe '2resize ' . ((&lines * 16 + 18) / 37)
exe 'vert 2resize ' . ((&columns * 83 + 83) / 167)
exe 'vert 3resize ' . ((&columns * 83 + 83) / 167)
tabnext 1
badd +24 database/seeders/User.ts
badd +5 app/Controllers/Http/UsersController.ts
badd +1 start/routes.ts
badd +17 resources/views/partials/navbar.edge
badd +51 app/Controllers/Http/LoginController.ts
badd +19 app/Controllers/Http/DashboardController.ts
badd +14 resources/views/admin/dashboard/index.edge
badd +54 resources/views/admin/dashboard/anggota.edge
badd +7 resources/views/components/sidebar.edge
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20 shortmess=csa
let &winminheight = s:save_winminheight
let &winminwidth = s:save_winminwidth
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
set hlsearch
nohlsearch
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
