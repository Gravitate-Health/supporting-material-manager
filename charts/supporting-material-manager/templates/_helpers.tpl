{{- define "supporting-material-manager.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "supporting-material-manager.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "supporting-material-manager.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "supporting-material-manager.labels" -}}
helm.sh/chart: {{ include "supporting-material-manager.chart" . }}
app.kubernetes.io/name: {{ include "supporting-material-manager.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "supporting-material-manager.selectorLabels" -}}
app.kubernetes.io/name: {{ include "supporting-material-manager.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "supporting-material-manager.appName" -}}
{{ include "supporting-material-manager.fullname" . }}
{{- end -}}

{{- define "supporting-material-manager.minioName" -}}
{{ include "supporting-material-manager.fullname" . }}-minio
{{- end -}}

{{- define "supporting-material-manager.secretName" -}}
{{ include "supporting-material-manager.fullname" . }}-secret
{{- end -}}

{{- define "supporting-material-manager.configMapName" -}}
{{ include "supporting-material-manager.fullname" . }}-config
{{- end -}}
