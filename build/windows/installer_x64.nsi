!define APP_NAME        "Bulk Mailer Go"
!define APP_SHORT       "BulkMailerGo"
!define APP_PUBLISHER   "Burak Aksoy"
!define APP_VERSION     "1.0.0"
!define EXE_NAME        "BulkMailerGo_x64.exe"

; Mutlak kaynak yolu: GitHub Actions Windows runner çalışma kökü
!define WORKSPACE       "D:\\a\\bulk-mailer-go\\bulk-mailer-go"
!define SRC_EXE_X64     "${WORKSPACE}\\build\\bin\\x64\\${EXE_NAME}"

!define INSTALL_DIR_REG "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${APP_SHORT}-x64"

OutFile "dist\\${APP_SHORT}_Setup_x64_${APP_VERSION}.exe"
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
  SetOutPath "$INSTDIR"

  ; Kritik satır: Mutlak, tırnak içinde yol veriyoruz
  File "${SRC_EXE_X64}"

  WriteUninstaller "$INSTDIR\\Uninstall.exe"

  CreateDirectory "$SMPROGRAMS\\${APP_NAME}"
  CreateShortCut "$SMPROGRAMS\\${APP_NAME}\\${APP_NAME}.lnk" "$INSTDIR\\${EXE_NAME}"
  CreateShortCut "$SMPROGRAMS\\${APP_NAME}\\Uninstall.lnk" "$INSTDIR\\Uninstall.exe"
  CreateShortCut "$DESKTOP\\${APP_NAME}.lnk" "$INSTDIR\\${EXE_NAME}"

  WriteRegStr HKLM "${INSTALL_DIR_REG}" "DisplayName" "${APP_NAME} (x64)"
  WriteRegStr HKLM "${INSTALL_DIR_REG}" "DisplayVersion" "${APP_VERSION}"
  WriteRegStr HKLM "${INSTALL_DIR_REG}" "Publisher" "${APP_PUBLISHER}"
  WriteRegStr HKLM "${INSTALL_DIR_REG}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "${INSTALL_DIR_REG}" "DisplayIcon" "$INSTDIR\\${EXE_NAME}"
  WriteRegStr HKLM "${INSTALL_DIR_REG}" "UninstallString" "$INSTDIR\\Uninstall.exe"
  WriteRegDWORD HKLM "${INSTALL_DIR_REG}" "NoModify" 1
  WriteRegDWORD HKLM "${INSTALL_DIR_REG}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  Delete "$SMPROGRAMS\\${APP_NAME}\\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\\${APP_NAME}\\Uninstall.lnk"
  RMDir  "$SMPROGRAMS\\${APP_NAME}"
  Delete "$DESKTOP\\${APP_NAME}.lnk"

  RMDir /r "$INSTDIR"

  DeleteRegKey HKLM "${INSTALL_DIR_REG}"
SectionEnd
