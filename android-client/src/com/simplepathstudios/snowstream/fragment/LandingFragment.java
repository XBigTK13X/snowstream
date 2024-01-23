package com.simplepathstudios.snowstream.fragment;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.simplepathstudios.snowstream.LoadingIndicator;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.SnowstreamSettings;

public class LandingFragment extends Fragment {
   @Override
   public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,
                            @Nullable Bundle savedInstanceState) {
      return inflater.inflate(R.layout.landing_fragment, container, false);
   }

   @Override
   public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
      super.onViewCreated(view, savedInstanceState);
      LoadingIndicator.setLoading(false);
   }
}
