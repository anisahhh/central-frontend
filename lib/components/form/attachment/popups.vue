<!--
Copyright 2017 ODK Central Developers
See the NOTICE file at the top-level directory of this distribution and at
https://github.com/opendatakit/central-frontend/blob/master/NOTICE.

This file is part of ODK Central. It is subject to the license terms in
the LICENSE file found in the top-level directory of this distribution and at
https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
including this file, may be copied, modified, propagated, or distributed
except according to the terms contained in the LICENSE file.
-->
<template>
  <div id="form-attachment-popups" class="modal-dialog">
    <div v-show="state" id="form-attachment-popups-main" class="modal-content">
      <div class="modal-header">
        <span class="icon-cloud-upload"></span>
        <h4 class="modal-title">Upload Files</h4>
      </div>
      <div class="modal-body">
        <template v-if="uploadStatus.current != null">
          <p>
            Please wait, uploading your
            {{ $pluralize('file', uploadStatus.total) }}:
          </p>
          <p id="form-attachment-popups-current">
            <strong>Sending {{ uploadStatus.current }}</strong>
            <span v-if="hasProgress">({{ percentLoaded }})</span>
          </p>
          <p v-if="uploadStatus.total !== 1">
            <template v-if="uploadStatus.remaining > 1">
              {{ uploadStatus.remaining.toLocaleString() }} files remain.
            </template>
            <template v-else>
              This is the last file.
            </template>
          </p>
        </template>
        <template v-else-if="plannedUploads.length !== 0 && !nameMismatch.state">
          <p id="form-attachment-popups-action-text">
            <strong>{{ plannedUploads.length.toLocaleString() }}
            {{ $pluralize('file', plannedUploads.length) }}</strong> ready for
            upload.
          </p>
          <p v-show="plannedUploads.length !== 0 && unmatchedFiles.length !== 0"
            id="form-attachment-popups-unmatched">
            <template v-if="unmatchedFiles.length === 1">
              <span class="icon-exclamation-triangle">
              </span><strong>1 file</strong> has a name we don’t recognize and will be
              ignored. To upload it, rename it or drag it onto its target.
            </template>
            <template v-else>
              <span class="icon-exclamation-triangle">
              </span><strong>{{ unmatchedFiles.length.toLocaleString() }}
              files</strong> have a name we don’t recognize and will be ignored. To
              upload them, rename them or drag them individually onto their targets.
            </template>
          </p>
          <p>
            <button ref="confirmButton" type="button" class="btn btn-primary"
              @click="$emit('confirm')">
              Looks good, proceed
            </button>
            <button type="button" class="btn btn-link" @click="$emit('cancel')">
              Cancel
            </button>
          </p>
        </template>
        <template v-else-if="unmatchedFiles.length === 1">
          We don’t recognize the file you are trying to upload. Please rename it
          to match the names listed above, or drag it individually onto its
          target.
        </template>
        <template v-else-if="unmatchedFiles.length > 1">
          We don’t recognize any of the files you are trying to upload. Please
          rename them to match the names listed above, or drag them individually
          onto their targets.
        </template>
        <template v-else-if="dragoverAttachment != null">
          <p id="form-attachment-popups-action-text">
            Drop now to upload this file as
            <strong>{{ dragoverAttachment.name }}</strong>.
          </p>
        </template>
        <template v-else-if="countOfFilesOverDropZone === 1">
          <p id="form-attachment-popups-action-text">
            Drag over the file entry you wish to replace with the file and drop
            to upload.
          </p>
        </template>
        <template v-else-if="countOfFilesOverDropZone > 1">
          <p id="form-attachment-popups-action-text">
            Drop now to prepare <strong>{{ countOfFilesOverDropZone.toLocaleString() }}
            files</strong> for upload to this form.
          </p>
        </template>
        <template v-else-if="countOfFilesOverDropZone === -1">
          <p id="form-attachment-popups-action-text">
            Drop now to upload to this form.
          </p>
        </template>
      </div>
    </div>
    <div v-show="uploadStatus.total !== 0" id="form-attachment-popups-backdrop">
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormAttachmentPopups',
  props: {
    countOfFilesOverDropZone: {
      type: Number,
      required: true
    },
    dragoverAttachment: Object, // eslint-disable-line vue/require-default-prop
    plannedUploads: {
      type: Array,
      required: true
    },
    unmatchedFiles: {
      type: Array,
      required: true
    },
    nameMismatch: {
      type: Object,
      required: true
    },
    uploadStatus: {
      type: Object,
      required: true
    }
  },
  computed: {
    state() {
      const showDuringDragover = this.countOfFilesOverDropZone !== 0;
      const showAfterDrop = this.unmatchedFiles.length !== 0 ||
        (this.plannedUploads.length !== 0 && !this.nameMismatch.state);
      const showDuringUpload = this.uploadStatus.current != null;
      return showDuringDragover || showAfterDrop || showDuringUpload;
    },
    hasProgress() {
      const { progress } = this.uploadStatus;
      return progress != null && progress.lengthComputable;
    },
    percentLoaded() {
      const { loaded, total } = this.uploadStatus.progress;
      // Not using the option { style: 'percent' }, because it is not supported
      // in IE 10.
      return `${Math.floor(100 * (loaded / total)).toLocaleString()}%`;
    }
  },
  updated() {
    if (this.plannedUploads.length !== 0 && !this.nameMismatch.state)
      this.$refs.confirmButton.focus();
  }
};
</script>

<style lang="sass">
@import '../../../../assets/scss/variables';

$z-index-backdrop: 1;
$z-index-main: $z-index-backdrop + 1;

$edge-offset: 25px;
$popup-width: 300px;

#form-attachment-popups {
  position: absolute;
}

#form-attachment-popups-main {
  bottom: $edge-offset;
  position: fixed;
  right: $edge-offset;
  width: $popup-width;
  z-index: $z-index-main;

  .modal-header {
    background-color: $color-action-background;

    .icon-cloud-upload {
      animation-direction: alternate;
      animation-duration: 4s;
      animation-iteration-count: infinite;
      animation-name: bob;
      animation-timing-function: ease-in-out;
      color: #fff;
      font-size: 90px;
      position: absolute;
      right: 10px;
      top: -25px;

      $outline-color: #0096c1;
      $lin-offset: 4px;
      $diag-offset: 3px;
      text-shadow:
        #{-$lin-offset} 0 0 $outline-color,
        0 #{-$lin-offset} 0 $outline-color,
        #{$lin-offset}  0 0 $outline-color,
        0 #{$lin-offset}  0 $outline-color,
        #{-$diag-offset} #{-$diag-offset} 0 $outline-color,
        #{$diag-offset}  #{-$diag-offset} 0 $outline-color,
        #{-$diag-offset} #{$diag-offset}  0 $outline-color,
        #{$diag-offset}  #{$diag-offset}  0 $outline-color;

      &::after {
        left: 20px;
        position: absolute;
        top: 20px;

        background-color: $outline-color;
        content: '';
        height: 45px;
        width: 45px;
        z-index: -1;
      }
    }
  }

  .modal-body {
    padding-bottom: 10px;

    #form-attachment-popups-unmatched {
      $padding: 10px;

      background-color: #f5c93b;
      font-size: 12px;
      line-height: 14px;
      margin-bottom: 17px;
      padding: $padding;
      padding-left: 30px;
      position: relative;

      .icon-exclamation-triangle {
        left: $padding;
        margin-top: 1px;
        position: absolute;
      }
    }
  }
}

#form-attachment-popups-backdrop {
  background-color: #000;
  bottom: 0;
  left: 0;
  opacity: .8;
  position: fixed;
  right: 0;
  top: 0;
  z-index: $z-index-backdrop;
}

@keyframes bob {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-9px);
  }
}

</style>
