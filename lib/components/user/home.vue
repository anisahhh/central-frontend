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
  <div>
    <page-head>
      <template slot="title">Users</template>
      <template slot="body">
        Web Users can log into this website to perform administrative tasks.
        Soon, you will be able to assign Web Users rights to only manage
        particular Projects.
      </template>
    </page-head>
    <page-body>
      <keep-alive>
        <router-view/>
      </keep-alive>
    </page-body>
  </div>
</template>

<script>
export default {
  name: 'UserHome'
};
</script>
