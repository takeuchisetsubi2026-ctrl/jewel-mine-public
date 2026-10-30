package com.wilduncle.jewelmine.codextest;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(JewelMineAdsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
