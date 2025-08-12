; =====
; File: build/windows/installer_arm64.nsi
; =====
!define APP_NAME        "Bulk Mailer Go"
!define APP_SHORT       "BulkMailerGo"
!define APP_PUBLISHER   "Burak Aksoy"
!ifndef APP_VERSION
!define APP_VERSION     "1.0.0"
!endif
!define EXE_NAME        "BulkMailerGo_arm64.exe"

!ifndef WORKSPACE
!define WORKSPACE "D:\a\bulk-mailer-go\bulk-mailer-go"
!endif

!define SRC_EXE_ARM64 "${WORKSPACE}\build\bin\arm64\${EXE_NAME}"
!define OUT_DIR       "${WORKSPACE}\build\windows\dist"
!define OUT_FILE      "${OUT_DIR}\${APP_SHORT}_Setup_ARM64_${APP_VERSION}.exe"
!define INSTALL_DIR_REG "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_SHORT}-ARM64"

OutFile "${OUT_FILE}"
InstallDir "$PROGRAMFILES64\${APP_NAME}"
RequestExecutionLevel admin

!include "MUI2.nsh"

; Çoklu dil: EN + TR
!insertmacro MUI_RESERVEFILE_LANGDLL
!define MUI_ABORTWARNING

; Sayfalar
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Uninstall sayfaları
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Diller
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "Turkish"

Section "Install"
  SetOutPath "$INSTDIR"
  File "${SRC_EXE_ARM64}"

  ; Uninstaller yaz
  WriteUninstaller "$INSTDIR\Uninstall.exe"

  ; Start Menu & Desktop shortcuts with WorkingDir
  CreateDirectory "$SMPROGRAMS\${APP_NAME}"
  CreateShortCut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\${EXE_NAME}" "" "$INSTDIR\${EXE_NAME}" 0 SW_SHOWNORMAL "" "$INSTDIR"
  CreateShortCut "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\${EXE_NAME}" 0 SW_SHOWNORMAL "" "$INSTDIR"
  CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${EXE_NAME}" "" "$INSTDIR\${EXE_NAME}" 0 SW_SHOWNORMAL "" "$INSTDIR"

  ; Uninstall kayıtları
  WriteRegStr   HKLM "${INSTALL_DIR_REG}" "DisplayName"     "${APP_NAME} (ARM64)"
  WriteRegStr   HKLM "${INSTALL_DIR_REG}" "DisplayVersion"  "${APP_VERSION}"
  WriteRegStr   HKLM "${INSTALL_DIR_REG}" "Publisher"       "${APP_PUBLISHER}"
  WriteRegStr   HKLM "${INSTALL_DIR_REG}" "InstallLocation" "$INSTDIR"
  WriteRegStr   HKLM "${INSTALL_DIR_REG}" "DisplayIcon"     "$INSTDIR\${EXE_NAME},0"
  WriteRegStr   HKLM "${INSTALL_DIR_REG}" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr   HKLM "${INSTALL_DIR_REG}" "QuietUninstallString" "$INSTDIR\Uninstall.exe /S"
  WriteRegDWORD HKLM "${INSTALL_DIR_REG}" "NoModify" 1
  WriteRegDWORD HKLM "${INSTALL_DIR_REG}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  ; Shortcuts
  Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk"
  RMDir  "$SMPROGRAMS\${APP_NAME}"
  Delete "$DESKTOP\${APP_NAME}.lnk"

  ; User data (full removal)
  RMDir /r "$APPDATA\${APP_SHORT}"
  RMDir /r "$APPDATA\${APP_NAME}"

  ; Install dir and registry
  RMDir /r "$INSTDIR"
  DeleteRegKey HKLM "${INSTALL_DIR_REG}"
SectionEnd
