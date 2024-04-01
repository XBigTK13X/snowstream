package com.simplepathstudios.snowstream.fragment.tv;

import android.os.Bundle;

import androidx.leanback.app.BrowseSupportFragment;

import com.simplepathstudios.snowstream.Util;

public class MainFragment extends BrowseSupportFragment {

    private static final String TAG = "TvMainFragment";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Util.log(TAG, "Starting the MainFragment for the TV app");
    }

}
