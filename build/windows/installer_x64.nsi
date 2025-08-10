; NSIS script for x64

!define APP_NAME        "Bulk Mailer Go"
!define APP_SHORT       "BulkMailerGo"
!define APP_PUBLISHER   "Burak Aksoy"
!define APP_VERSION     "1.0.0"
!define EXE_NAME        "BulkMailerGo_x64.exe"

!ifndef WORKSPACE
!define WORKSPACE "D:\\a\\bulk-mailer-go\\bulk-mailer-go"
!endif

!define SRC_EXE_X64   "${WORKSPACE}\\build\\bin\\x64\\${EXE_NAME}"
!define OUT_DIR       "${WORKSPACE}\\build\\windows\\dist"
!define OUT_FILE      "${OUT_DIR}\\${APP_SHORT}_Setup_x64_${APP_VERSION}.exe"

!define INSTALL_DIR_REG "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${APP_SHORT}-x64"

OutFile "${OUT_FILE}"
InstallDir "$PROGRAMFILES64\\${APP_NAME}"
RequestExecutionLevel admin

!include "MUI2.nsh"
!define MUI_ABORTWARNING
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_LANGUAGE "English"

Section "Install"
  ; Çalışma zamanı işlemler
  SetOutPath "$INSTDIR"
  File "${SRC_EXE_X64}"

  ; Uninstaller yaz
  WriteUninstaller "$INSTDIR\\Uninstall.exe"

  ; Kısayollar
  CreateDirectory "$SMPROGRAMS\\${APP_NAME}"
  CreateShortCut "$SMPROGRAMS\\${APP_NAME}\\${APP_NAME}.lnk" "$INSTDIR\\${EXE_NAME}"
  CreateShortCut "$SMPROGRAMS\\${APP_NAME}\\Uninstall.lnk" "$INSTDIR\\Uninstall.exe"
  CreateShortCut "$DESKTOP\\${APP_NAME}.lnk" "$INSTDIR\\${EXE_NAME}"

  ; Kayıt defteri (Uninstall)
  WriteRegStr   HKLM "${INSTALL_DIR_REG}" "DisplayName"     "${APP_NAME} (x64)"
  WriteRegStr   HKLM "${INSTALL_DIR_REG}" "DisplayVersion"  "${APP_VERSION}"
  WriteRegStr   HKLM "${INSTALL_DIR_REG}" "Publisher"       "${APP_PUBLISHER}"
  WriteRegStr   HKLM "${INSTALL_DIR_REG}" "InstallLocation" "$INSTDIR"
  WriteRegStr   HKLM "${INSTALL_DIR_REG}" "DisplayIcon"     "$INSTDIR\\${EXE_NAME}"
  WriteRegStr   HKLM "${INSTALL_DIR_REG}" "UninstallString" "$INSTDIR\\Uninstall.exe"
  WriteRegDWORD HKLM "${INSTALL_DIR_REG}" "NoModify" 1
  WriteRegDWORD HKLM "${INSTALL_DIR_REG}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  ; Kısayolları sil
  Delete "$SMPROGRAMS\\${APP_NAME}\\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\\${APP_NAME}\\Uninstall.lnk"
  RMDir  "$SMPROGRAMS\\${APP_NAME}"

  ; Masaüstü kısayolu
  Delete "$DESKTOP\\${APP_NAME}.lnk"

  ; Uygulama klasörü
  RMDir /r "$INSTDIR"

  ; Uninstall registry
  DeleteRegKey HKLM "${INSTALL_DIR_REG}"
SectionEnd
